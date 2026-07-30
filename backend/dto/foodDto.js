function toFoodCatalogDto(food) {
    return {
        food: food.food,
        protein: food.protein,
        calories: food.calories,
        amount: food.amount,
        fats: food.fats,
        carbs: food.carbs,
    };
}

function toFoodCatalogListDto(foods) {
    return foods.map(toFoodCatalogDto);
}

function toUserFoodDto(userFood) {
    return {
        id: userFood.id,
        username: userFood.username,
        amount: userFood.amount,
        food: userFood.food ? toFoodCatalogDto(userFood.food) : null,
    };
}

function toUserFoodListDto(userFoods) {
    return userFoods.map(toUserFoodDto);
}

module.exports = { toFoodCatalogDto, toFoodCatalogListDto, toUserFoodDto, toUserFoodListDto };
