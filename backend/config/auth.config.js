if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}

module.exports = {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30,
    passwordResetTokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES) || 60,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}