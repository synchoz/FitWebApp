const Exercise = require('../models/exercise');

async function getExercisesList() {
    return Exercise.findAll({ attributes: ['exercise', 'category'] });
}

module.exports = { getExercisesList };
