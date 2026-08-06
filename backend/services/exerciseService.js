const { Op } = require('sequelize');
const Exercise = require('../models/exercise');
const { ConflictError, NotFoundError } = require('../errors/AppError');

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

async function getExerciseByName(exercise) {
    const exerciseRow = await Exercise.findByPk(exercise);
    if (!exerciseRow) {
        throw new NotFoundError('Exercise not found');
    }
    return exerciseRow;
}

async function updateExercise(exercise, { category }) {
    const exerciseRow = await getExerciseByName(exercise);
    await exerciseRow.update({ category });
    return exerciseRow;
}

async function deleteExercise(exercise) {
    const exerciseRow = await getExerciseByName(exercise);
    await exerciseRow.destroy();
    return exerciseRow;
}

module.exports = { getExercisesList, createExercise, updateExercise, deleteExercise };
