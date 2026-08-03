jest.mock('../models/food');

const { Op } = require('sequelize');
const Food = require('../models/food');
const foodService = require('./foodService');
const { ConflictError } = require('../errors/AppError');

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

describe('createFood', () => {
    test('creates a new catalog entry when the name is unused', async () => {
        Food.findOne.mockResolvedValue(null);
        const created = { food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 };
        Food.create.mockResolvedValue(created);

        const result = await foodService.createFood({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });

        expect(Food.findOne).toHaveBeenCalledWith({ where: { food: { [Op.iLike]: 'Mango' } } });
        expect(Food.create).toHaveBeenCalledWith({ food: 'Mango', calories: 60, protein: 1, carbs: 15, fats: 0, amount: 100 });
        expect(result).toBe(created);
    });

    test('rejects a name that already exists (case-insensitively)', async () => {
        Food.findOne.mockResolvedValue({ food: 'Banana' });

        await expect(foodService.createFood({ food: 'banana', calories: 1, protein: 1, carbs: 1, fats: 1, amount: 100 }))
            .rejects.toThrow(ConflictError);
        expect(Food.create).not.toHaveBeenCalled();
    });
});
