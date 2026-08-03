const { Op } = require('sequelize');
const Exercise = require('../models/exercise');
const { ConflictError } = require('../errors/AppError');

async function getExercisesList() {
    return Exercise.findAll({ attributes: ['exercise', 'category'] });
}

async function createExercise({ exercise, category }) {
    const existing = await Exercise.findOne({ where: { exercise: { [Op.iLike]: exercise } } });
    if (existing) {
        throw new ConflictError('An exercise with this name already exists');
    }

    return Exercise.create({ exercise, category });
}

module.exports = { getExercisesList, createExercise };
