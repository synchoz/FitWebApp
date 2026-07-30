// User is a real Sequelize model here (spied on, not jest.mock'd) because
// models/refreshtoken.js calls RefreshToken.belongsTo(User, ...) at import time,
// which requires User to actually be a Model subclass rather than an automock.
jest.mock('../models/refreshtoken');

const crypto = require('crypto');
const { Op } = require('sequelize');
const RefreshToken = require('../models/refreshtoken');
const User = require('../models/user');
const refreshTokenService = require('./refreshTokenService');
const { UnauthorizedError } = require('../errors/AppError');

function hashOf(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(User, 'findByPk').mockResolvedValue(null);
});

afterEach(() => {
    User.findByPk.mockRestore();
});

describe('issue', () => {
    test('creates a hashed row and returns the raw token', async () => {
        RefreshToken.create.mockResolvedValue({});

        const { token, expiresAt } = await refreshTokenService.issue(5);

        expect(token).toEqual(expect.any(String));
        expect(RefreshToken.create).toHaveBeenCalledWith({
            userId: 5,
            tokenHash: hashOf(token),
            expiresAt,
        });
    });
});

describe('rotate', () => {
    test('rejects with UnauthorizedError when the token is not found', async () => {
        RefreshToken.findOne.mockResolvedValue(null);

        await expect(refreshTokenService.rotate('bogus')).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('rejects with UnauthorizedError when the token was already revoked', async () => {
        RefreshToken.findOne.mockResolvedValue({ revokedAt: new Date(), expiresAt: new Date(Date.now() + 10000) });

        await expect(refreshTokenService.rotate('used')).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('replaying an already-revoked token revokes every session for that user', async () => {
        RefreshToken.findOne.mockResolvedValue({
            userId: 5,
            revokedAt: new Date(),
            expiresAt: new Date(Date.now() + 10000),
        });
        RefreshToken.update.mockResolvedValue([2]);

        await expect(refreshTokenService.rotate('stolen')).rejects.toBeInstanceOf(UnauthorizedError);

        expect(RefreshToken.update).toHaveBeenCalledWith(
            { revokedAt: expect.any(Date) },
            { where: { userId: 5, revokedAt: null } }
        );
    });

    test('rejects with UnauthorizedError when the token has expired', async () => {
        RefreshToken.findOne.mockResolvedValue({ revokedAt: null, expiresAt: new Date(Date.now() - 1000) });

        await expect(refreshTokenService.rotate('expired')).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('rejects with UnauthorizedError when the owning user no longer exists', async () => {
        RefreshToken.findOne.mockResolvedValue({
            userId: 5,
            revokedAt: null,
            expiresAt: new Date(Date.now() + 10000),
            update: jest.fn(),
        });
        User.findByPk.mockResolvedValue(null);

        await expect(refreshTokenService.rotate('orphaned')).rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('revokes the old row and issues a fresh token on success', async () => {
        const stored = {
            userId: 5,
            revokedAt: null,
            expiresAt: new Date(Date.now() + 10000),
            update: jest.fn().mockResolvedValue(undefined),
        };
        RefreshToken.findOne.mockResolvedValue(stored);
        const user = { id: 5 };
        User.findByPk.mockResolvedValue(user);
        RefreshToken.create.mockResolvedValue({});

        const result = await refreshTokenService.rotate('valid-token');

        expect(stored.update).toHaveBeenCalledWith({ revokedAt: expect.any(Date) });
        expect(result.user).toBe(user);
        expect(result.refreshToken).toEqual(expect.any(String));
    });
});

describe('revoke', () => {
    test('does nothing when no token is given', async () => {
        await refreshTokenService.revoke(undefined);

        expect(RefreshToken.update).not.toHaveBeenCalled();
    });

    test('marks the matching, still-active row as revoked', async () => {
        RefreshToken.update.mockResolvedValue([1]);

        await refreshTokenService.revoke('some-token');

        expect(RefreshToken.update).toHaveBeenCalledWith(
            { revokedAt: expect.any(Date) },
            { where: { tokenHash: hashOf('some-token'), revokedAt: null } }
        );
    });
});

describe('revokeAllForUser', () => {
    test('marks every active row for the user as revoked', async () => {
        RefreshToken.update.mockResolvedValue([2]);

        await refreshTokenService.revokeAllForUser(5);

        expect(RefreshToken.update).toHaveBeenCalledWith(
            { revokedAt: expect.any(Date) },
            { where: { userId: 5, revokedAt: null } }
        );
    });
});

describe('purgeExpired', () => {
    test('deletes rows past their expiry, regardless of revoked status', async () => {
        RefreshToken.destroy.mockResolvedValue(4);

        const result = await refreshTokenService.purgeExpired();

        expect(RefreshToken.destroy).toHaveBeenCalledWith({
            where: { expiresAt: { [Op.lt]: expect.any(Date) } },
        });
        expect(result).toBe(4);
    });
});
