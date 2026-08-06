jest.mock('../models/weightlog');

const WeightLog = require('../models/weightlog');
const weightService = require('./weightService');
const { NotFoundError } = require('../errors/AppError');

beforeEach(() => {
    jest.clearAllMocks();
});

test('addWeight creates a log row scoped to the given user', async () => {
    const created = { id: 1, userid: 5, weight: 80, logdate: '2026-01-01' };
    WeightLog.create.mockResolvedValue(created);

    const result = await weightService.addWeight(5, 80, '2026-01-01');

    expect(WeightLog.create).toHaveBeenCalledWith({ userid: 5, weight: 80, logdate: '2026-01-01' });
    expect(result).toBe(created);
});

test('getWeightsForUser scopes to the user, orders by date ascending, and applies pagination', async () => {
    const found = { count: 2, rows: [{ id: 1 }, { id: 2 }] };
    WeightLog.findAndCountAll.mockResolvedValue(found);

    const result = await weightService.getWeightsForUser(5, { limit: 100, offset: 0 });

    expect(WeightLog.findAndCountAll).toHaveBeenCalledWith({
        where: { userid: 5 },
        order: [['logdate', 'ASC']],
        limit: 100,
        offset: 0,
    });
    expect(result).toBe(found);
});

describe('updateWeight', () => {
    test('updates only the provided fields on the found log', async () => {
        const weightLog = { id: 1, weight: 80, logdate: '2026-01-01', update: jest.fn().mockResolvedValue(undefined) };
        WeightLog.findByPk.mockResolvedValue(weightLog);

        const result = await weightService.updateWeight(1, { weight: 82.5, logdate: undefined });

        expect(weightLog.update).toHaveBeenCalledWith({ weight: 82.5 });
        expect(result).toBe(weightLog);
    });

    test('rejects with NotFoundError when the log does not exist', async () => {
        WeightLog.findByPk.mockResolvedValue(null);

        await expect(weightService.updateWeight(999, { weight: 80 }))
            .rejects.toBeInstanceOf(NotFoundError);
    });
});

describe('deleteWeight', () => {
    test('destroys and returns the found log', async () => {
        const weightLog = { id: 1, destroy: jest.fn().mockResolvedValue(undefined) };
        WeightLog.findByPk.mockResolvedValue(weightLog);

        const result = await weightService.deleteWeight(1);

        expect(weightLog.destroy).toHaveBeenCalled();
        expect(result).toBe(weightLog);
    });

    test('rejects with NotFoundError when the log does not exist', async () => {
        WeightLog.findByPk.mockResolvedValue(null);

        await expect(weightService.deleteWeight(999)).rejects.toBeInstanceOf(NotFoundError);
    });
});
