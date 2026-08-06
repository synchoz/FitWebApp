jest.mock('../models/user');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../utils/cloudinary');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const User = require('../models/user');
const { uploadImageBuffer } = require('../utils/cloudinary');
const userService = require('./userService');
const { ValidationError, UnauthorizedError } = require('../errors/AppError');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('register', () => {
    test('hashes the password and creates the user when the email is free', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed-password');
        const created = { id: 1, username: 'jdoe', email: 'jdoe@example.com', hash: 'hashed-password' };
        User.create.mockResolvedValue(created);

        const result = await userService.register('jdoe', 'jdoe@example.com', 'plaintext');

        expect(bcrypt.hash).toHaveBeenCalledWith('plaintext', 10);
        expect(User.create).toHaveBeenCalledWith({ username: 'jdoe', email: 'jdoe@example.com', hash: 'hashed-password' });
        expect(result).toBe(created);
    });

    test('rejects up front when findOne already sees the email', async () => {
        User.findOne.mockResolvedValue({ id: 1 });

        await expect(userService.register('jdoe', 'taken@example.com', 'plaintext'))
            .rejects.toBeInstanceOf(ValidationError);
        expect(User.create).not.toHaveBeenCalled();
    });

    test('converts a concurrent unique-constraint violation into a friendly ValidationError', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed-password');
        User.create.mockRejectedValue(new UniqueConstraintError({}));

        await expect(userService.register('jdoe', 'race@example.com', 'plaintext'))
            .rejects.toBeInstanceOf(ValidationError);
    });

    test('lets an unrelated create error propagate unchanged', async () => {
        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashed-password');
        const dbError = new Error('connection lost');
        User.create.mockRejectedValue(dbError);

        await expect(userService.register('jdoe', 'jdoe@example.com', 'plaintext'))
            .rejects.toBe(dbError);
    });
});

describe('login', () => {
    test('returns the user and a signed access token on success', async () => {
        const user = { id: 1, username: 'jdoe', hash: 'hashed-password', failedLoginAttempts: 0, lockedUntil: null };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('signed-jwt');

        const result = await userService.login('jdoe@example.com', 'plaintext');

        expect(bcrypt.compare).toHaveBeenCalledWith('plaintext', 'hashed-password');
        expect(result).toEqual({ user, accessToken: 'signed-jwt' });
    });

    test('includes the user\'s role in the signed JWT payload', async () => {
        const user = { id: 1, username: 'jdoe', role: 'admin', hash: 'hashed-password', failedLoginAttempts: 0, lockedUntil: null };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('signed-jwt');

        await userService.login('jdoe@example.com', 'plaintext');

        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 1, username: 'jdoe', role: 'admin' },
            expect.anything(),
            expect.anything()
        );
    });

    test('rejects with UnauthorizedError when no user matches the email', async () => {
        User.findOne.mockResolvedValue(null);

        await expect(userService.login('nobody@example.com', 'plaintext'))
            .rejects.toBeInstanceOf(UnauthorizedError);
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('rejects with UnauthorizedError when the password does not match', async () => {
        const user = { id: 1, hash: 'hashed-password', failedLoginAttempts: 0, lockedUntil: null, update: jest.fn().mockResolvedValue(undefined) };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        await expect(userService.login('jdoe@example.com', 'wrong'))
            .rejects.toBeInstanceOf(UnauthorizedError);
    });

    test('gives the same error message for a bad email and a bad password', async () => {
        User.findOne.mockResolvedValue(null);
        let noUserMessage;
        try {
            await userService.login('nobody@example.com', 'plaintext');
        } catch (err) {
            noUserMessage = err.message;
        }

        User.findOne.mockResolvedValue({ id: 1, hash: 'hashed-password', failedLoginAttempts: 0, lockedUntil: null, update: jest.fn().mockResolvedValue(undefined) });
        bcrypt.compare.mockResolvedValue(false);
        let badPasswordMessage;
        try {
            await userService.login('jdoe@example.com', 'wrong');
        } catch (err) {
            badPasswordMessage = err.message;
        }

        expect(noUserMessage).toBe(badPasswordMessage);
    });

    test('increments failedLoginAttempts on a wrong password without locking below the threshold', async () => {
        const user = { id: 1, hash: 'hashed-password', failedLoginAttempts: 3, lockedUntil: null, update: jest.fn().mockResolvedValue(undefined) };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        await expect(userService.login('jdoe@example.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedError);

        expect(user.update).toHaveBeenCalledWith({ failedLoginAttempts: 4, lockedUntil: null });
    });

    test('locks the account once failed attempts reach the threshold', async () => {
        const user = { id: 1, hash: 'hashed-password', failedLoginAttempts: 4, lockedUntil: null, update: jest.fn().mockResolvedValue(undefined) };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(false);

        await expect(userService.login('jdoe@example.com', 'wrong')).rejects.toBeInstanceOf(UnauthorizedError);

        expect(user.update).toHaveBeenCalledWith({ failedLoginAttempts: 0, lockedUntil: expect.any(Date) });
    });

    test('rejects a locked account without checking the password', async () => {
        const user = { id: 1, hash: 'hashed-password', failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + 60000) };
        User.findOne.mockResolvedValue(user);

        await expect(userService.login('jdoe@example.com', 'correct')).rejects.toBeInstanceOf(UnauthorizedError);
        expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    test('clears failedLoginAttempts and lockedUntil after a successful login that follows prior failures', async () => {
        const user = { id: 1, hash: 'hashed-password', failedLoginAttempts: 2, lockedUntil: null, update: jest.fn().mockResolvedValue(undefined) };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('signed-jwt');

        await userService.login('jdoe@example.com', 'correct');

        expect(user.update).toHaveBeenCalledWith({ failedLoginAttempts: 0, lockedUntil: null });
    });
});

describe('updateUserDetails', () => {
    test('updates and returns the user', async () => {
        const user = { id: 1, update: jest.fn().mockResolvedValue(undefined) };
        User.findByPk.mockResolvedValue(user);

        const details = { fullname: 'John Doe', email: 'jdoe@example.com', address: 'A', phonenumber: '1', weight: 80, gender: 'male' };
        const result = await userService.updateUserDetails(1, details);

        expect(user.update).toHaveBeenCalledWith(details);
        expect(result).toBe(user);
    });

    test('converts a unique-constraint violation on email into a friendly ValidationError', async () => {
        const user = { id: 1, update: jest.fn().mockRejectedValue(new UniqueConstraintError({})) };
        User.findByPk.mockResolvedValue(user);

        await expect(userService.updateUserDetails(1, { email: 'taken@example.com' }))
            .rejects.toBeInstanceOf(ValidationError);
    });
});

describe('resetPassword', () => {
    test('hashes and stores the new password on the user', async () => {
        const user = { id: 1, update: jest.fn().mockResolvedValue(undefined) };
        User.findByPk.mockResolvedValue(user);
        bcrypt.hash.mockResolvedValue('new-hashed-password');

        const result = await userService.resetPassword(1, 'newplaintext');

        expect(bcrypt.hash).toHaveBeenCalledWith('newplaintext', 10);
        expect(user.update).toHaveBeenCalledWith({ hash: 'new-hashed-password' });
        expect(result).toBe(user);
    });
});

describe('updateProfileImage', () => {
    const pngBuffer = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(20),
    ]);

    test('rejects with ValidationError when no file was given', async () => {
        await expect(userService.updateProfileImage(1, undefined))
            .rejects.toBeInstanceOf(ValidationError);
        expect(User.findByPk).not.toHaveBeenCalled();
    });

    test('rejects with ValidationError when the file bytes are not a real image', async () => {
        const file = { buffer: Buffer.from('not-an-image') };

        await expect(userService.updateProfileImage(1, file))
            .rejects.toBeInstanceOf(ValidationError);
        expect(User.findByPk).not.toHaveBeenCalled();
        expect(uploadImageBuffer).not.toHaveBeenCalled();
    });

    test('uploads the file and stores the resulting secure_url', async () => {
        const user = { id: 1, update: jest.fn().mockResolvedValue(undefined) };
        User.findByPk.mockResolvedValue(user);
        uploadImageBuffer.mockResolvedValue({ secure_url: 'https://cdn.example.com/img.png' });
        const file = { buffer: pngBuffer };

        const result = await userService.updateProfileImage(1, file);

        expect(uploadImageBuffer).toHaveBeenCalledWith(file);
        expect(user.update).toHaveBeenCalledWith({ imagelink: 'https://cdn.example.com/img.png' });
        expect(result).toBe(user);
    });
});

describe('listUsers', () => {
    test('fetches only the summary columns, ordered by username', async () => {
        const users = [{ id: 1, username: 'adam' }, { id: 2, username: 'zoe' }];
        User.findAll.mockResolvedValue(users);

        const result = await userService.listUsers();

        expect(User.findAll).toHaveBeenCalledWith({
            attributes: ['id', 'username', 'email', 'fullname', 'role'],
            order: [['username', 'ASC']],
        });
        expect(result).toBe(users);
    });
});
