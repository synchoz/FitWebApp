jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin } = require('./authJwt');
const { ForbiddenError } = require('../errors/AppError');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('rejects with 401 when no token is given', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token was given' });
    expect(next).not.toHaveBeenCalled();
});

test('rejects with 401 when the token fails verification', async () => {
    jwt.verify.mockImplementation(() => {
        throw new Error('invalid signature');
    });
    const req = { headers: { 'x-access-token': 'bad-token' } };
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
});

test('attaches userId/username/role and calls next() for a valid token', async () => {
    jwt.verify.mockReturnValue({ id: 1, username: 'jdoe', role: 'user' });
    const req = { headers: { 'x-access-token': 'good-token' } };
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(req.userId).toBe(1);
    expect(req.username).toBe('jdoe');
    expect(req.role).toBe('user');
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
});

describe('requireAdmin', () => {
    test('calls next() when req.role is admin', async () => {
        const req = { role: 'admin' };
        const res = mockRes();
        const next = jest.fn();

        await requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });

    test('passes a ForbiddenError to next() when req.role is not admin', async () => {
        const req = { role: 'user' };
        const res = mockRes();
        const next = jest.fn();

        await requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
});
