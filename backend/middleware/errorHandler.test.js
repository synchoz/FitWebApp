const errorHandler = require('./errorHandler');
const { ValidationError, NotFoundError } = require('../errors/AppError');

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    console.error.mockRestore();
});

test('maps a ValidationError to its status code and message', () => {
    const res = mockRes();

    errorHandler(new ValidationError('bad input'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'bad input' });
});

test('maps a NotFoundError to 404', () => {
    const res = mockRes();

    errorHandler(new NotFoundError('missing'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'missing' });
});

test('maps a MulterError to 400 with its own message', () => {
    const res = mockRes();
    const multerError = new Error('File too large');
    multerError.name = 'MulterError';

    errorHandler(multerError, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'File too large' });
});

test('maps an unrecognized error to a generic 500 without leaking details', () => {
    const res = mockRes();

    errorHandler(new Error('something internal and sensitive'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Something went wrong' });
});
