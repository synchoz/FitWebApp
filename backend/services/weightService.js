const WeightLog = require('../models/weightlog');
const { NotFoundError } = require('../errors/AppError');

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

async function getWeightLogById(id) {
    const weightLog = await WeightLog.findByPk(id);
    if (!weightLog) {
        throw new NotFoundError('Weight log not found');
    }
    return weightLog;
}

async function updateWeight(id, { weight, logdate }) {
    const weightLog = await getWeightLogById(id);
    const updates = {};
    if (weight !== undefined) {
        updates.weight = weight;
    }
    if (logdate !== undefined) {
        updates.logdate = logdate;
    }
    await weightLog.update(updates);
    return weightLog;
}

async function deleteWeight(id) {
    const weightLog = await getWeightLogById(id);
    await weightLog.destroy();
    return weightLog;
}

module.exports = { addWeight, getWeightsForUser, updateWeight, deleteWeight };
