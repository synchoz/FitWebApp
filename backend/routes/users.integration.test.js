// Exercises the real route wiring (rate limiter, verifyToken, multer, controllers,
// validators, and the centralized error handler) end to end. The only DB-touching
// boundary replaced is the service layer (explicit factories, so the real
// models/*.js files - and their module-load-time Sequelize associations - never load).
// verifyToken itself is stateless, and jsonwebtoken is real, so tokens are actually
// signed/verified against process.env.JWT_SECRET.

jest.mock('../services/userService', () => ({
    register: jest.fn(),
    login: jest.fn(),
    signAccessToken: jest.fn(),
    getUserById: jest.fn(),
    updateUserDetails: jest.fn(),
    updateProfileImage: jest.fn(),
    resetPassword: jest.fn(),
}));
jest.mock('../services/refreshTokenService', () => ({
    issue: jest.fn(),
    rotate: jest.fn(),
    revoke: jest.fn(),
    revokeAllForUser: jest.fn(),
}));
jest.mock('../services/passwordResetService', () => ({
    requestReset: jest.fn(),
    resetPassword: jest.fn(),
}));
jest.mock('../services/weightService', () => ({
    addWeight: jest.fn(),
    getWeightsForUser: jest.fn(),
}));
jest.mock('../services/foodService', () => ({
    getFoodsList: jest.fn(),
}));
jest.mock('../services/userFoodService', () => ({
    getUserFoodList: jest.fn(),
    addUserFood: jest.fn(),
    updateUserFoodAmount: jest.fn(),
    deleteUserFood: jest.fn(),
}));

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const refreshTokenService = require('../services/refreshTokenService');
const weightService = require('../services/weightService');
const usersRouter = require('./users');
const errorHandler = require('../middleware/errorHandler');
const { UnauthorizedError, ValidationError } = require('../errors/AppError');

function buildApp() {
    const app = express();
    app.use(express.json());
    app.use('/api/users', usersRouter);
    app.use(errorHandler);
    return app;
}

function signToken(overrides = {}) {
    return jwt.sign(
        { id: 1, username: 'jdoe', ...overrides },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: 86400 }
    );
}

const app = buildApp();

beforeEach(() => {
    jest.clearAllMocks();
});

describe('POST /api/users/register', () => {
    test('400s when a required field is missing', async () => {
        const res = await request(app).post('/api/users/register').send({ username: 'jdoe', password: 'pw' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/required/i);
        expect(userService.register).not.toHaveBeenCalled();
    });

    test('400s on a malformed email without ever calling the service', async () => {
        const res = await request(app)
            .post('/api/users/register')
            .send({ username: 'jdoe', email: 'not-an-email', password: 'pw' });

        expect(res.status).toBe(400);
        expect(userService.register).not.toHaveBeenCalled();
    });

    test('201s and shapes the response through the DTO on success', async () => {
        userService.register.mockResolvedValue({ id: 1, username: 'jdoe', email: 'jdoe@example.com', hash: 'secret-hash' });

        const res = await request(app)
            .post('/api/users/register')
            .send({ username: 'jdoe', email: 'jdoe@example.com', password: 'pw123456' });

        expect(res.status).toBe(201);
        expect(res.body.result).toEqual(expect.objectContaining({ id: 1, username: 'jdoe', email: 'jdoe@example.com' }));
        expect(res.body.result.hash).toBeUndefined();
    });

    test('propagates a duplicate-email rejection from the service as a 400', async () => {
        userService.register.mockRejectedValue(new ValidationError('An account with this email already exists'));

        const res = await request(app)
            .post('/api/users/register')
            .send({ username: 'jdoe', email: 'jdoe@example.com', password: 'pw123456' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already exists/i);
    });
});

describe('POST /api/users/login', () => {
    test('200s with an access token and a refresh token on success', async () => {
        userService.login.mockResolvedValue({
            user: { id: 1, username: 'jdoe', email: 'jdoe@example.com' },
            accessToken: 'signed-jwt',
        });
        refreshTokenService.issue.mockResolvedValue({ token: 'raw-refresh-token', expiresAt: new Date() });

        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'jdoe@example.com', password: 'pw' });

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBe('signed-jwt');
        expect(res.body.refreshToken).toBe('raw-refresh-token');
        expect(refreshTokenService.issue).toHaveBeenCalledWith(1);
    });

    test('401s with the service message on bad credentials', async () => {
        userService.login.mockRejectedValue(new UnauthorizedError('Email or password is incorrect'));

        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'jdoe@example.com', password: 'wrong' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Email or password is incorrect');
    });
});

describe('POST /api/users/refresh-token', () => {
    test('400s when refreshToken is missing', async () => {
        const res = await request(app).post('/api/users/refresh-token').send({});

        expect(res.status).toBe(400);
        expect(refreshTokenService.rotate).not.toHaveBeenCalled();
    });

    test('401s when the refresh token is invalid or expired', async () => {
        refreshTokenService.rotate.mockRejectedValue(new UnauthorizedError('Invalid or expired refresh token'));

        const res = await request(app)
            .post('/api/users/refresh-token')
            .send({ refreshToken: 'stale' });

        expect(res.status).toBe(401);
    });

    test('200s with a new access and refresh token on success', async () => {
        refreshTokenService.rotate.mockResolvedValue({
            user: { id: 1, username: 'jdoe', email: 'jdoe@example.com' },
            refreshToken: 'new-raw-refresh-token',
        });
        userService.signAccessToken.mockReturnValue('new-signed-jwt');

        const res = await request(app)
            .post('/api/users/refresh-token')
            .send({ refreshToken: 'valid' });

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBe('new-signed-jwt');
        expect(res.body.refreshToken).toBe('new-raw-refresh-token');
    });
});

describe('POST /api/users/logout (protected route)', () => {
    test('revokes the given refresh token and responds 200', async () => {
        const res = await request(app)
            .post('/api/users/logout')
            .set('x-access-token', signToken())
            .send({ refreshToken: 'raw-refresh-token' });

        expect(res.status).toBe(200);
        expect(refreshTokenService.revoke).toHaveBeenCalledWith('raw-refresh-token');
    });
});

describe('GET /api/users/getWeight (protected route)', () => {
    test('401s with no token, and never reaches the service', async () => {
        const res = await request(app).get('/api/users/getWeight');

        expect(res.status).toBe(401);
        expect(weightService.getWeightsForUser).not.toHaveBeenCalled();
    });

    test('401s with an expired/invalid token, and never reaches the service', async () => {
        const res = await request(app)
            .get('/api/users/getWeight')
            .set('x-access-token', 'not-a-real-token');

        expect(res.status).toBe(401);
        expect(weightService.getWeightsForUser).not.toHaveBeenCalled();
    });

    test('200s and returns the DTO-shaped list and pagination metadata for a valid token', async () => {
        weightService.getWeightsForUser.mockResolvedValue({
            count: 1,
            rows: [{ id: 1, weight: 80, logdate: '2026-01-01' }],
        });

        const res = await request(app)
            .get('/api/users/getWeight')
            .set('x-access-token', signToken());

        expect(res.status).toBe(200);
        expect(weightService.getWeightsForUser).toHaveBeenCalledWith(1, { limit: 100, offset: 0 });
        expect(res.body.result).toEqual([{ id: 1, weight: 80, logdate: '2026-01-01' }]);
        expect(res.body.pagination).toEqual({ page: 1, limit: 100, total: 1, totalPages: 1 });
    });
});

describe('POST /api/users/upload (multer file-type guard)', () => {
    test('rejects a disallowed mime type with a 400 instead of a raw 500', async () => {
        const res = await request(app)
            .post('/api/users/upload')
            .set('x-access-token', signToken())
            .attach('file', Buffer.from('not-an-image'), { filename: 'evil.exe', contentType: 'application/x-msdownload' });

        expect(res.status).toBe(400);
    });
});
