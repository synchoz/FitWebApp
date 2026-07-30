const crypto = require('crypto');
const { Op } = require('sequelize');
const RefreshToken = require('../models/refreshtoken');
const User = require('../models/user');
const config = require('../config/auth.config.js');
const { UnauthorizedError } = require('../errors/AppError');

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

async function issue(userId) {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await RefreshToken.create({ userId, tokenHash: hashToken(rawToken), expiresAt });

    return { token: rawToken, expiresAt };
}

async function rotate(rawToken) {
    const stored = await RefreshToken.findOne({ where: { tokenHash: hashToken(rawToken) } });
    if (!stored) {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (stored.revokedAt) {
        // A revoked token being presented again means it was stolen and replayed
        // (or the legitimate client retried after losing the rotation response) —
        // either way the token chain is compromised, so kill every session for this user.
        await revokeAllForUser(stored.userId);
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    if (stored.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findByPk(stored.userId);
    if (!user) {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    await stored.update({ revokedAt: new Date() });
    const next = await issue(stored.userId);

    return { user, refreshToken: next.token };
}

async function revoke(rawToken) {
    if (!rawToken) {
        return;
    }
    await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { tokenHash: hashToken(rawToken), revokedAt: null } }
    );
}

async function revokeAllForUser(userId) {
    await RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId, revokedAt: null } }
    );
}

async function purgeExpired() {
    // Only expiresAt is checked (not revokedAt) so a revoked-but-unexpired row
    // stays around for rotate()'s reuse-detection to still find it.
    return RefreshToken.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
}

module.exports = { issue, rotate, revoke, revokeAllForUser, purgeExpired };
