// Food is a real Sequelize model here (spied on, not jest.mock'd) because
// models/userfood.js calls UserFood.belongsTo(Food, ...) at import time, which
// requires Food to actually be a Model subclass rather than an automock.
jest.mock('../models/userfood');

const UserFood = require('../models/userfood');
const Food = require('../models/food');
const userFoodService = require('./userFoodService');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Food, 'findByPk').mockResolvedValue(null);
});

afterEach(() => {
    Food.findByPk.mockRestore();
});

test('getUserFoodList scopes to the username, includes the food catalog association, and applies pagination', async () => {
    const found = { count: 1, rows: [{ id: 1 }] };
    UserFood.findAndCountAll.mockResolvedValue(found);

    const result = await userFoodService.getUserFoodList('jdoe', { limit: 100, offset: 0 });

    expect(UserFood.findAndCountAll).toHaveBeenCalledWith({
        where: { username: 'jdoe' },
        include: [{ model: Food }],
        limit: 100,
        offset: 0,
    });
    expect(result).toBe(found);
});

describe('addUserFood', () => {
    test('rejects with NotFoundError when the food is not in the catalog', async () => {
        Food.findByPk.mockResolvedValue(null);

        await expect(userFoodService.addUserFood('jdoe', 'Unobtainium', 100))
            .rejects.toBeInstanceOf(NotFoundError);
        expect(UserFood.create).not.toHaveBeenCalled();
    });

    test('creates the log row when the food exists in the catalog', async () => {
        Food.findByPk.mockResolvedValue({ food: 'Banana' });
        const created = { id: 1 };
        UserFood.create.mockResolvedValue(created);

        const result = await userFoodService.addUserFood('jdoe', 'Banana', 100);

        expect(Food.findByPk).toHaveBeenCalledWith('Banana');
        expect(UserFood.create).toHaveBeenCalledWith({ username: 'jdoe', userfood: 'Banana', amount: 100 });
        expect(result).toBe(created);
    });
});

describe('ownership checks (via update/delete)', () => {
    test('updateUserFoodAmount rejects with NotFoundError when the row does not exist', async () => {
        UserFood.findOne.mockResolvedValue(null);

        await expect(userFoodService.updateUserFoodAmount(1, 'jdoe', 200))
            .rejects.toBeInstanceOf(NotFoundError);
    });

    test('updateUserFoodAmount rejects with ForbiddenError when the row belongs to someone else', async () => {
        UserFood.findOne.mockResolvedValue({ id: 1, username: 'someone-else' });

        await expect(userFoodService.updateUserFoodAmount(1, 'jdoe', 200))
            .rejects.toBeInstanceOf(ForbiddenError);
    });

    test('updateUserFoodAmount updates the row when owned by the caller', async () => {
        const row = { id: 1, username: 'jdoe', update: jest.fn().mockResolvedValue(undefined) };
        UserFood.findOne.mockResolvedValue(row);

        const result = await userFoodService.updateUserFoodAmount(1, 'jdoe', 200);

        expect(row.update).toHaveBeenCalledWith({ amount: 200 });
        expect(result).toBe(row);
    });

    test('deleteUserFood destroys the row when owned by the caller', async () => {
        const row = { id: 1, username: 'jdoe', destroy: jest.fn().mockResolvedValue(undefined) };
        UserFood.findOne.mockResolvedValue(row);

        const result = await userFoodService.deleteUserFood(1, 'jdoe');

        expect(row.destroy).toHaveBeenCalled();
        expect(result).toBe(row);
    });

    test('deleteUserFood rejects with ForbiddenError when the row belongs to someone else', async () => {
        UserFood.findOne.mockResolvedValue({ id: 1, username: 'someone-else', destroy: jest.fn() });

        await expect(userFoodService.deleteUserFood(1, 'jdoe')).rejects.toBeInstanceOf(ForbiddenError);
    });
});
