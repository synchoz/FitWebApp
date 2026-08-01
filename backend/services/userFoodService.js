const UserFood = require('../models/userfood');
const Food = require('../models/food');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

async function getUserFoodList(username, { limit, offset, logdate } = {}) {
    return UserFood.findAndCountAll({
        where: { username, ...(logdate ? { logdate } : {}) },
        include: [{ model: Food }],
        limit,
        offset,
    });
}

async function addUserFood(username, food, amount, logdate) {
    const existingFood = await Food.findByPk(food);
    if (!existingFood) {
        throw new NotFoundError(`Food "${food}" was not found in the catalog`);
    }

    return UserFood.create({
        username,
        userfood: food,
        amount,
        logdate,
    });
}

async function getOwnedUserFood(id, username) {
    const userFood = await UserFood.findOne({ where: { id } });
    if (!userFood) {
        throw new NotFoundError('Food log entry not found');
    }
    if (userFood.username !== username) {
        throw new ForbiddenError('You do not have access to this food log entry');
    }
    return userFood;
}

async function updateUserFoodAmount(id, username, newAmount) {
    const userFood = await getOwnedUserFood(id, username);
    await userFood.update({ amount: newAmount });
    return userFood;
}

async function deleteUserFood(id, username) {
    const userFood = await getOwnedUserFood(id, username);
    await userFood.destroy();
    return userFood;
}

module.exports = { getUserFoodList, addUserFood, updateUserFoodAmount, deleteUserFood };
