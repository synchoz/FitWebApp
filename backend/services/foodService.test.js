jest.mock('../models/food');

const { Op } = require('sequelize');
const Food = require('../models/food');
const foodService = require('./foodService');
const { ConflictError, NotFoundError } = require('../errors/AppError');

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

describe('updateFood', () => {
    test('updates only the provided fields on the found entry', async () => {
        const food = { food: 'Banana', calories: 90, update: jest.fn().mockResolvedValue(undefined) };
        Food.findByPk.mockResolvedValue(food);

        const result = await foodService.updateFood('Banana', { calories: 95, protein: undefined, carbs: undefined, fats: undefined, amount: undefined });

        expect(food.update).toHaveBeenCalledWith({ calories: 95 });
        expect(result).toBe(food);
    });

    test('rejects with NotFoundError when the entry does not exist', async () => {
        Food.findByPk.mockResolvedValue(null);

        await expect(foodService.updateFood('Nope', { calories: 1 })).rejects.toBeInstanceOf(NotFoundError);
    });
});

describe('deleteFood', () => {
    test('destroys and returns the found entry', async () => {
        const food = { food: 'Banana', destroy: jest.fn().mockResolvedValue(undefined) };
        Food.findByPk.mockResolvedValue(food);

        const result = await foodService.deleteFood('Banana');

        expect(food.destroy).toHaveBeenCalled();
        expect(result).toBe(food);
    });

    test('rejects with NotFoundError when the entry does not exist', async () => {
        Food.findByPk.mockResolvedValue(null);

        await expect(foodService.deleteFood('Nope')).rejects.toBeInstanceOf(NotFoundError);
    });
});
