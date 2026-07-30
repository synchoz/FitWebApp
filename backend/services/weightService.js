const WeightLog = require('../models/weightlog');

async function addWeight(userId, weight, date) {
    return WeightLog.create({
        userid: userId,
        weight,
        logdate: date,
    });
}

async function getWeightsForUser(userId, { limit, offset } = {}) {
    return WeightLog.findAndCountAll({
        where: { userid: userId },
        order: [['logdate', 'ASC']],
        limit,
        offset,
    });
}

module.exports = { addWeight, getWeightsForUser };
