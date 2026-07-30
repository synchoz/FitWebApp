jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const { verifyToken } = require('./authJwt');

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

test('attaches userId/username and calls next() for a valid token', async () => {
    jwt.verify.mockReturnValue({ id: 1, username: 'jdoe' });
    const req = { headers: { 'x-access-token': 'good-token' } };
    const res = mockRes();
    const next = jest.fn();

    await verifyToken(req, res, next);

    expect(req.userId).toBe(1);
    expect(req.username).toBe('jdoe');
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
});
