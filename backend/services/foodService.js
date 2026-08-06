const { Op } = require('sequelize');
const Food = require('../models/food');
const { ConflictError, NotFoundError } = require('../errors/AppError');

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

async function getFoodByName(food) {
    const foodRow = await Food.findByPk(food);
    if (!foodRow) {
        throw new NotFoundError('Food not found');
    }
    return foodRow;
}

async function updateFood(food, { calories, protein, carbs, fats, amount }) {
    const foodRow = await getFoodByName(food);
    const updates = {};
    if (calories !== undefined) updates.calories = calories;
    if (protein !== undefined) updates.protein = protein;
    if (carbs !== undefined) updates.carbs = carbs;
    if (fats !== undefined) updates.fats = fats;
    if (amount !== undefined) updates.amount = amount;
    await foodRow.update(updates);
    return foodRow;
}

async function deleteFood(food) {
    const foodRow = await getFoodByName(food);
    await foodRow.destroy();
    return foodRow;
}

module.exports = { getFoodsList, createFood, updateFood, deleteFood };
