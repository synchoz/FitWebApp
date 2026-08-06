const userService = require('../services/userService');
const refreshTokenService = require('../services/refreshTokenService');
const passwordResetService = require('../services/passwordResetService');
const { toUserDto } = require('../dto/userDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isValidEmail, isPositiveNumber, isStrongPassword } = require('../utils/validators');

exports.register = asyncHandler(async function (req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        throw new ValidationError('username, email and password are required');
    }
    if (!isValidEmail(email)) {
        throw new ValidationError('A valid email address is required');
    }
    if (!isStrongPassword(password)) {
        throw new ValidationError('Password must be at least 8 characters and include a letter and a number');
    }

    const user = await userService.register(username, email, password);

    res.status(201).json({
        message: 'User was created successfully',
        result: toUserDto(user),
    });
});

exports.validateUser = asyncHandler(async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ValidationError('email and password are required');
    }

    const { user, accessToken } = await userService.login(email, password);
    const { token: refreshToken } = await refreshTokenService.issue(user.id);

    res.status(200).json({
        message: 'Login was successful',
        email: user.email,
        username: user.username,
        role: user.role,
        accessToken,
        refreshToken,
    });
});

exports.refreshToken = asyncHandler(async function (req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ValidationError('refreshToken is required');
    }

    const { user, refreshToken: newRefreshToken } = await refreshTokenService.rotate(refreshToken);
    const accessToken = userService.signAccessToken(user);

    res.status(200).json({
        message: 'Token refreshed successfully',
        email: user.email,
        username: user.username,
        role: user.role,
        accessToken,
        refreshToken: newRefreshToken,
    });
});

exports.logout = asyncHandler(async function (req, res) {
    await refreshTokenService.revoke(req.body.refreshToken);

    res.status(200).json({
        message: 'Logged out successfully',
    });
});

exports.forgotPassword = asyncHandler(async function (req, res) {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
        throw new ValidationError('A valid email address is required');
    }

    await passwordResetService.requestReset(email);

    res.status(200).json({
        message: 'If an account exists for that email, a reset link has been sent',
    });
});

exports.resetPassword = asyncHandler(async function (req, res) {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        throw new ValidationError('token and newPassword are required');
    }
    if (!isStrongPassword(newPassword)) {
        throw new ValidationError('Password must be at least 8 characters and include a letter and a number');
    }

    await passwordResetService.resetPassword(token, newPassword);

    res.status(200).json({
        message: 'Password has been reset successfully',
    });
});

exports.getUserInfo = asyncHandler(async function (req, res) {
    const user = await userService.getUserById(req.userId);

    res.status(200).json({
        message: 'Successfully fetched user info',
        result: toUserDto(user),
    });
});

exports.updateUserDetails = asyncHandler(async function (req, res) {
    const { fullname, email, address, phonenumber, weight, gender } = req.body;

    if (email !== undefined && email !== null && !isValidEmail(email)) {
        throw new ValidationError('A valid email address is required');
    }
    if (phonenumber !== undefined && phonenumber !== null && !isPositiveNumber(phonenumber)) {
        throw new ValidationError('phonenumber must be a positive number');
    }
    if (weight !== undefined && weight !== null && !isPositiveNumber(weight)) {
        throw new ValidationError('weight must be a positive number');
    }

    const user = await userService.updateUserDetails(req.userId, {
        fullname, email, address, phonenumber, weight, gender,
    });

    res.status(200).json({
        message: 'User was updated successfully',
        result: toUserDto(user),
    });
});

exports.uploadImage = asyncHandler(async function (req, res) {
    const user = await userService.updateProfileImage(req.userId, req.file);

    res.status(200).json({
        message: 'Profile image was updated successfully',
        result: toUserDto(user),
    });
});
