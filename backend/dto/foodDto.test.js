const {
    toFoodCatalogDto,
    toFoodCatalogListDto,
    toUserFoodDto,
    toUserFoodListDto,
} = require('./foodDto');

test('toFoodCatalogDto maps the expected fields', () => {
    const food = { food: 'Banana', protein: 1, calories: 105, amount: 100, fats: 0, carbs: 27 };

    expect(toFoodCatalogDto(food)).toEqual(food);
});

test('toFoodCatalogListDto maps every entry', () => {
    const foods = [
        { food: 'Banana', protein: 1, calories: 105, amount: 100, fats: 0, carbs: 27 },
        { food: 'Apple', protein: 0, calories: 95, amount: 100, fats: 0, carbs: 25 },
    ];

    expect(toFoodCatalogListDto(foods)).toEqual(foods);
});

test('toUserFoodDto nests the associated food catalog entry', () => {
    const userFood = {
        id: 1,
        username: 'jdoe',
        amount: 150,
        food: { food: 'Banana', protein: 1, calories: 105, amount: 100, fats: 0, carbs: 27 },
    };

    expect(toUserFoodDto(userFood)).toEqual({
        id: 1,
        username: 'jdoe',
        amount: 150,
        food: { food: 'Banana', protein: 1, calories: 105, amount: 100, fats: 0, carbs: 27 },
    });
});

test('toUserFoodDto tolerates a missing associated food (null-linked row)', () => {
    const userFood = { id: 1, username: 'jdoe', amount: 150, food: null };

    expect(toUserFoodDto(userFood)).toEqual({ id: 1, username: 'jdoe', amount: 150, food: null });
});

test('toUserFoodListDto maps every entry', () => {
    const userFoods = [
        { id: 1, username: 'jdoe', amount: 150, food: null },
        { id: 2, username: 'jdoe', amount: 200, food: null },
    ];

    expect(toUserFoodListDto(userFoods)).toHaveLength(2);
});
