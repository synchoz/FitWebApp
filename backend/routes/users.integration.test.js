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
    listUsers: jest.fn(),
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
    updateWeight: jest.fn(),
    deleteWeight: jest.fn(),
}));
jest.mock('../services/foodService', () => ({
    getFoodsList: jest.fn(),
    createFood: jest.fn(),
    updateFood: jest.fn(),
    deleteFood: jest.fn(),
}));
jest.mock('../services/userFoodService', () => ({
    getUserFoodList: jest.fn(),
    addUserFood: jest.fn(),
    updateUserFoodAmount: jest.fn(),
    deleteUserFood: jest.fn(),
}));
jest.mock('../services/exerciseService', () => ({
    getExercisesList: jest.fn(),
    createExercise: jest.fn(),
    updateExercise: jest.fn(),
    deleteExercise: jest.fn(),
}));
jest.mock('../services/userExerciseService', () => ({
    getUserExerciseList: jest.fn(),
    addUserExercise: jest.fn(),
    updateUserExercise: jest.fn(),
    deleteUserExercise: jest.fn(),
    copyExerciseLog: jest.fn(),
}));

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const refreshTokenService = require('../services/refreshTokenService');
const weightService = require('../services/weightService');
const foodService = require('../services/foodService');
const exerciseService = require('../services/exerciseService');
const userExerciseService = require('../services/userExerciseService');
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

describe('GET /api/users/getUserExerciseList (protected route)', () => {
    test('401s with no token, and never reaches the service', async () => {
        const res = await request(app).get('/api/users/getUserExerciseList');

        expect(res.status).toBe(401);
        expect(userExerciseService.getUserExerciseList).not.toHaveBeenCalled();
    });

    test('200s and returns the DTO-shaped list and pagination metadata for a valid token', async () => {
        userExerciseService.getUserExerciseList.mockResolvedValue({
            count: 1,
            rows: [{ id: 1, setnumber: 1, reps: 8, weight: 60, logdate: '2026-08-01', exercise: null }],
        });

        const res = await request(app)
            .get('/api/users/getUserExerciseList')
            .set('x-access-token', signToken());

        expect(res.status).toBe(200);
        expect(userExerciseService.getUserExerciseList).toHaveBeenCalledWith(1, { limit: 100, offset: 0, logdate: undefined });
        expect(res.body.result).toEqual([{ id: 1, setnumber: 1, reps: 8, weight: 60, logdate: '2026-08-01', exercise: null }]);
        expect(res.body.pagination).toEqual({ page: 1, limit: 100, total: 1, totalPages: 1 });
    });
});

describe('POST /api/users/addUserExercise (protected route)', () => {
    test('400s when reps is not a positive integer, and never reaches the service', async () => {
        const res = await request(app)
            .post('/api/users/addUserExercise')
            .set('x-access-token', signToken())
            .send({ exercise: 'Barbell Curl', reps: 0, date: '2026-08-01' });

        expect(res.status).toBe(400);
        expect(userExerciseService.addUserExercise).not.toHaveBeenCalled();
    });

    test('201s and shapes the response through the DTO on success', async () => {
        userExerciseService.addUserExercise.mockResolvedValue({
            id: 1, setnumber: 1, reps: 8, weight: null, logdate: '2026-08-01', exercise: null,
        });

        const res = await request(app)
            .post('/api/users/addUserExercise')
            .set('x-access-token', signToken())
            .send({ exercise: 'Pull-Up', reps: 8, date: '2026-08-01' });

        expect(res.status).toBe(201);
        expect(userExerciseService.addUserExercise).toHaveBeenCalledWith(1, 'Pull-Up', 8, null, '2026-08-01');
        expect(res.body.result).toEqual(expect.objectContaining({ id: 1, setnumber: 1, reps: 8, weight: null }));
    });
});

describe('POST /api/users/addFood (protected route)', () => {
    test('401s with no token, and never reaches the service', async () => {
        const res = await request(app)
            .post('/api/users/addFood')
            .send({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });

        expect(res.status).toBe(401);
        expect(foodService.createFood).not.toHaveBeenCalled();
    });

    test('400s when amount is not a positive number, and never reaches the service', async () => {
        const res = await request(app)
            .post('/api/users/addFood')
            .set('x-access-token', signToken())
            .send({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 0 });

        expect(res.status).toBe(400);
        expect(foodService.createFood).not.toHaveBeenCalled();
    });

    test('201s and shapes the response through the DTO on success', async () => {
        foodService.createFood.mockResolvedValue({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });

        const res = await request(app)
            .post('/api/users/addFood')
            .set('x-access-token', signToken())
            .send({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });

        expect(res.status).toBe(201);
        expect(foodService.createFood).toHaveBeenCalledWith({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });
        expect(res.body.result).toEqual({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });
    });
});

describe('POST /api/users/addExercise (protected route)', () => {
    test('401s with no token, and never reaches the service', async () => {
        const res = await request(app)
            .post('/api/users/addExercise')
            .send({ exercise: 'Cable Fly', category: 'Chest' });

        expect(res.status).toBe(401);
        expect(exerciseService.createExercise).not.toHaveBeenCalled();
    });

    test('400s when exercise name is missing, and never reaches the service', async () => {
        const res = await request(app)
            .post('/api/users/addExercise')
            .set('x-access-token', signToken())
            .send({ category: 'Chest' });

        expect(res.status).toBe(400);
        expect(exerciseService.createExercise).not.toHaveBeenCalled();
    });

    test('defaults category to "Custom" when not provided', async () => {
        exerciseService.createExercise.mockResolvedValue({ exercise: 'Cable Fly', category: 'Custom' });

        const res = await request(app)
            .post('/api/users/addExercise')
            .set('x-access-token', signToken())
            .send({ exercise: 'Cable Fly' });

        expect(res.status).toBe(201);
        expect(exerciseService.createExercise).toHaveBeenCalledWith({ exercise: 'Cable Fly', category: 'Custom' });
        expect(res.body.result).toEqual({ exercise: 'Cable Fly', category: 'Custom' });
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

describe('admin routes', () => {
    test('403s a non-admin token on every admin route without reaching the service', async () => {
        const nonAdminToken = signToken({ role: 'user' });

        const getUsersRes = await request(app).get('/api/users/admin/users').set('x-access-token', nonAdminToken);
        const getWeightLogsRes = await request(app).get('/api/users/admin/weightlogs?userId=2').set('x-access-token', nonAdminToken);
        const updateWeightRes = await request(app).post('/api/users/admin/weightlogs/update').set('x-access-token', nonAdminToken).send({ id: 1, weight: 80 });
        const deleteWeightRes = await request(app).post('/api/users/admin/weightlogs/delete').set('x-access-token', nonAdminToken).send({ id: 1 });
        const updateFoodRes = await request(app).post('/api/users/admin/foods/update').set('x-access-token', nonAdminToken).send({ food: 'Banana', calories: 90 });
        const deleteFoodRes = await request(app).post('/api/users/admin/foods/delete').set('x-access-token', nonAdminToken).send({ food: 'Banana' });
        const updateExerciseRes = await request(app).post('/api/users/admin/exercises/update').set('x-access-token', nonAdminToken).send({ exercise: 'Deadlift', category: 'Legs' });
        const deleteExerciseRes = await request(app).post('/api/users/admin/exercises/delete').set('x-access-token', nonAdminToken).send({ exercise: 'Deadlift' });

        for (const res of [getUsersRes, getWeightLogsRes, updateWeightRes, deleteWeightRes, updateFoodRes, deleteFoodRes, updateExerciseRes, deleteExerciseRes]) {
            expect(res.status).toBe(403);
        }
        expect(userService.listUsers).not.toHaveBeenCalled();
        expect(weightService.updateWeight).not.toHaveBeenCalled();
        expect(weightService.deleteWeight).not.toHaveBeenCalled();
        expect(foodService.updateFood).not.toHaveBeenCalled();
        expect(foodService.deleteFood).not.toHaveBeenCalled();
        expect(exerciseService.updateExercise).not.toHaveBeenCalled();
        expect(exerciseService.deleteExercise).not.toHaveBeenCalled();
    });

    test('401s an unauthenticated request without reaching the service', async () => {
        const res = await request(app).get('/api/users/admin/users');

        expect(res.status).toBe(401);
        expect(userService.listUsers).not.toHaveBeenCalled();
    });

    test('GET /api/users/admin/users 200s with the user list for an admin token', async () => {
        userService.listUsers.mockResolvedValue([{ id: 1, username: 'jdoe', email: 'jdoe@example.com', fullname: 'John Doe', role: 'user' }]);

        const res = await request(app)
            .get('/api/users/admin/users')
            .set('x-access-token', signToken({ role: 'admin' }));

        expect(res.status).toBe(200);
        expect(res.body.result).toEqual([{ id: 1, username: 'jdoe', email: 'jdoe@example.com', fullname: 'John Doe', role: 'user' }]);
    });

    test('GET /api/users/admin/weightlogs 400s when userId is missing', async () => {
        const res = await request(app)
            .get('/api/users/admin/weightlogs')
            .set('x-access-token', signToken({ role: 'admin' }));

        expect(res.status).toBe(400);
        expect(weightService.getWeightsForUser).not.toHaveBeenCalled();
    });

    test('GET /api/users/admin/weightlogs 200s with another user\'s logs for an admin token', async () => {
        weightService.getWeightsForUser.mockResolvedValue({ count: 1, rows: [{ id: 5, weight: 70, logdate: '2026-01-01' }] });

        const res = await request(app)
            .get('/api/users/admin/weightlogs?userId=2')
            .set('x-access-token', signToken({ role: 'admin' }));

        expect(res.status).toBe(200);
        expect(weightService.getWeightsForUser).toHaveBeenCalledWith(2);
        expect(res.body.result).toEqual([{ id: 5, weight: 70, logdate: '2026-01-01' }]);
    });

    test('POST /api/users/admin/weightlogs/update 200s for an admin token', async () => {
        weightService.updateWeight.mockResolvedValue({ id: 5, weight: 71, logdate: '2026-01-02' });

        const res = await request(app)
            .post('/api/users/admin/weightlogs/update')
            .set('x-access-token', signToken({ role: 'admin' }))
            .send({ id: 5, weight: 71, date: '2026-01-02' });

        expect(res.status).toBe(200);
        expect(weightService.updateWeight).toHaveBeenCalledWith(5, { weight: 71, logdate: '2026-01-02' });
    });

    test('POST /api/users/admin/foods/update 200s for an admin token', async () => {
        foodService.updateFood.mockResolvedValue({ food: 'Banana', calories: 95, protein: 1, carbs: 22, fats: 0, amount: 100 });

        const res = await request(app)
            .post('/api/users/admin/foods/update')
            .set('x-access-token', signToken({ role: 'admin' }))
            .send({ food: 'Banana', calories: 95 });

        expect(res.status).toBe(200);
        expect(foodService.updateFood).toHaveBeenCalled();
    });

    test('POST /api/users/admin/exercises/update 200s for an admin token', async () => {
        exerciseService.updateExercise.mockResolvedValue({ exercise: 'Deadlift', category: 'Legs' });

        const res = await request(app)
            .post('/api/users/admin/exercises/update')
            .set('x-access-token', signToken({ role: 'admin' }))
            .send({ exercise: 'Deadlift', category: 'Legs' });

        expect(res.status).toBe(200);
        expect(exerciseService.updateExercise).toHaveBeenCalledWith('Deadlift', { category: 'Legs' });
    });
});
