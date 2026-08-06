const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const User = require('../models/user');
const config = require('../config/auth.config.js');
const { uploadImageBuffer } = require('../utils/cloudinary');
const { isValidImageBuffer } = require('../utils/imageSignature');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../errors/AppError');

const SALT_ROUNDS = 10;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

async function register(username, email, password) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        throw new ValidationError('An account with this email already exists');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
        return await User.create({ username, email, hash });
    } catch (err) {
        // The findOne check above is a fast path; the unique index is the real
        // guard against a concurrent registration for the same email winning the race.
        if (err instanceof UniqueConstraintError) {
            throw new ValidationError('An account with this email already exists');
        }
        throw err;
    }
}

function signAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.secret,
        { algorithm: 'HS256', expiresIn: config.accessTokenExpiresIn }
    );
}

async function login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new UnauthorizedError('Email or password is incorrect');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedError('Account temporarily locked due to too many failed login attempts');
    }

    const passwordMatches = await bcrypt.compare(password, user.hash);
    if (!passwordMatches) {
        await registerFailedLogin(user);
        throw new UnauthorizedError('Email or password is incorrect');
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        await user.update({ failedLoginAttempts: 0, lockedUntil: null });
    }

    return { user, accessToken: signAccessToken(user) };
}

async function registerFailedLogin(user) {
    const failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    const isNowLocked = failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

    await user.update({
        failedLoginAttempts: isNowLocked ? 0 : failedLoginAttempts,
        lockedUntil: isNowLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
    });
}

async function resetPassword(userId, newPassword) {
    const user = await getUserById(userId);
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.update({ hash });
    return user;
}

async function getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    return user;
}

async function updateUserDetails(userId, { fullname, email, address, phonenumber, weight, gender }) {
    const user = await getUserById(userId);

    try {
        await user.update({ fullname, email, address, phonenumber, weight, gender });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            throw new ValidationError('An account with this email already exists');
        }
        throw err;
    }
    return user;
}

async function updateProfileImage(userId, file) {
    if (!file) {
        throw new ValidationError('No image file was provided');
    }
    if (!isValidImageBuffer(file.buffer)) {
        throw new ValidationError('File does not appear to be a valid JPEG, PNG, or WEBP image');
    }

    const user = await getUserById(userId);
    const result = await uploadImageBuffer(file);
    await user.update({ imagelink: result.secure_url });
    return user;
}

async function listUsers() {
    return User.findAll({
        attributes: ['id', 'username', 'email', 'fullname', 'role'],
        order: [['username', 'ASC']],
    });
}

module.exports = {
    register,
    login,
    signAccessToken,
    getUserById,
    updateUserDetails,
    updateProfileImage,
    resetPassword,
    listUsers,
};
