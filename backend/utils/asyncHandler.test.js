const asyncHandler = require('./asyncHandler');

test('calls the wrapped handler with req, res, next', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const req = {};
    const res = {};
    const next = jest.fn();

    await asyncHandler(fn)(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
});

test('forwards a rejected promise to next() instead of throwing', async () => {
    const error = new Error('boom');
    const fn = jest.fn().mockRejectedValue(error);
    const next = jest.fn();

    await asyncHandler(fn)({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
});
