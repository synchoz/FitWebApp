jest.mock('../models/food');

const Food = require('../models/food');
const foodService = require('./foodService');

beforeEach(() => {
    jest.clearAllMocks();
});

test('getFoodsList fetches only the catalog columns the DTO needs', async () => {
    const foods = [{ food: 'Banana' }, { food: 'Apple' }];
    Food.findAll.mockResolvedValue(foods);

    const result = await foodService.getFoodsList();

    expect(Food.findAll).toHaveBeenCalledWith({
        attributes: ['food', 'protein', 'calories', 'amount', 'fats', 'carbs'],
    });
    expect(result).toBe(foods);
});
