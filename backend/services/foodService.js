const Food = require('../models/food');

async function getFoodsList() {
    return Food.findAll({
        attributes: ['food', 'protein', 'calories', 'amount', 'fats', 'carbs'],
    });
}

module.exports = { getFoodsList };
