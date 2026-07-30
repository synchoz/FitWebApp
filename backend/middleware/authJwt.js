const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const asyncHandler = require('../utils/asyncHandler');

const verifyToken = asyncHandler(async function (req, res, next) {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ message: 'No token was given' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, config.secret);
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    req.userId = decoded.id;
    req.username = decoded.username;
    next();
});

module.exports = { verifyToken };
