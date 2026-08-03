const { Op } = require('sequelize');
const Food = require('../models/food');
const { ConflictError } = require('../errors/AppError');

async function getFoodsList() {
    return Food.findAll({
        attributes: ['food', 'protein', 'calories', 'amount', 'fats', 'carbs'],
    });
}

async function createFood({ food, calories, protein, carbs, fats, amount }) {
    const existing = await Food.findOne({ where: { food: { [Op.iLike]: food } } });
    if (existing) {
        throw new ConflictError('A food with this name already exists');
    }

    return Food.create({ food, calories, protein, carbs, fats, amount });
}

module.exports = { getFoodsList, createFood };
