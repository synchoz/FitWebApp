// User is a real Sequelize model here (spied on, not jest.mock'd) because
// models/passwordresettoken.js calls PasswordResetToken.belongsTo(User, ...) at
// import time, which requires User to actually be a Model subclass rather than
// an automock.
jest.mock('../models/passwordresettoken');
jest.mock('./userService');
jest.mock('./refreshTokenService');

const { Op } = require('sequelize');
const PasswordResetToken = require('../models/passwordresettoken');
const User = require('../models/user');
const userService = require('./userService');
const refreshTokenService = require('./refreshTokenService');
const passwordResetService = require('./passwordResetService');
const { UnauthorizedError } = require('../errors/AppError');

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
});

afterEach(() => {
    User.findOne.mockRestore();
});

describe('requestReset', () => {
    test('resolves without creating a token when no user matches the email', async () => {
        await passwordResetService.requestReset('nobody@example.com');

        expect(PasswordResetToken.create).not.toHaveBeenCalled();
    });

    test('creates a hashed token for the matching user and logs the reset link', async () => {
        User.findOne.mockResolvedValue({ id: 5 });
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await passwordResetService.requestReset('jdoe@example.com');

        expect(PasswordResetToken.create).toHaveBeenCalledWith(expect.objectContaining({
            userId: 5,
            expiresAt: expect.any(Date),
        }));
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('jdoe@example.com'));
        logSpy.mockRestore();
    });
});

describe('resetPassword', () => {
    test('rejects with UnauthorizedError when the token is not found', async () => {
        PasswordResetToken.findOne.mockResolvedValue(null);

        await expect(passwordResetService.resetPassword('bogus', 'newpass'))
            .rejects.toBeInstanceOf(UnauthorizedError);
        expect(userService.resetPassword).not.toHaveBeenCalled();
    });

    test('rejects with UnauthorizedError when the token was already used', async () => {
        PasswordResetToken.findOne.mockResolvedValue({
            userId: 5, usedAt: new Date(), expiresAt: new Date(Date.now() + 10000),
        });

        await expect(passwordResetService.resetPassword('used', 'newpass'))
            .rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('rejects with UnauthorizedError when the token has expired', async () => {
        PasswordResetToken.findOne.mockResolvedValue({
            userId: 5, usedAt: null, expiresAt: new Date(Date.now() - 1000),
        });

        await expect(passwordResetService.resetPassword('expired', 'newpass'))
            .rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('updates the password, marks the token used, and revokes all refresh tokens on success', async () => {
        const stored = {
            userId: 5,
            usedAt: null,
            expiresAt: new Date(Date.now() + 10000),
            update: jest.fn().mockResolvedValue(undefined),
        };
        PasswordResetToken.findOne.mockResolvedValue(stored);

        await passwordResetService.resetPassword('valid-token', 'newpass');

        expect(userService.resetPassword).toHaveBeenCalledWith(5, 'newpass');
        expect(stored.update).toHaveBeenCalledWith({ usedAt: expect.any(Date) });
        expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith(5);
    });
});

describe('purgeExpired', () => {
    test('deletes rows past their expiry', async () => {
        PasswordResetToken.destroy.mockResolvedValue(3);

        const result = await passwordResetService.purgeExpired();

        expect(PasswordResetToken.destroy).toHaveBeenCalledWith({
            where: { expiresAt: { [Op.lt]: expect.any(Date) } },
        });
        expect(result).toBe(3);
    });
});
