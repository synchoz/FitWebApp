const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/user');
const PasswordResetToken = require('../models/passwordresettoken');
const userService = require('./userService');
const refreshTokenService = require('./refreshTokenService');
const config = require('../config/auth.config.js');
const { UnauthorizedError } = require('../errors/AppError');

function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}

async function requestReset(email) {
    const user = await User.findOne({ where: { email } });

    // Always resolves the same way whether or not the email exists, so callers
    // can't use this endpoint to enumerate registered accounts.
    if (!user) {
        return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.passwordResetTokenTtlMinutes * 60 * 1000);

    await PasswordResetToken.create({ userId: user.id, tokenHash: hashToken(rawToken), expiresAt });

    const resetLink = `${config.frontendUrl}/reset-password?token=${rawToken}`;
    console.log(`Password reset requested for ${email}: ${resetLink}`);
}

async function resetPassword(rawToken, newPassword) {
    const stored = await PasswordResetToken.findOne({ where: { tokenHash: hashToken(rawToken) } });
    if (!stored || stored.usedAt || stored.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired reset token');
    }

    await userService.resetPassword(stored.userId, newPassword);
    await stored.update({ usedAt: new Date() });
    await refreshTokenService.revokeAllForUser(stored.userId);
}

async function purgeExpired() {
    return PasswordResetToken.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
}

module.exports = { requestReset, resetPassword, purgeExpired };
