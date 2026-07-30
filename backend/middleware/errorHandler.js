const { AppError } = require('../errors/AppError');

module.exports = function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({ message: err.message });
    }

    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
};
