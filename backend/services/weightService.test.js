jest.mock('../models/weightlog');

const WeightLog = require('../models/weightlog');
const weightService = require('./weightService');

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
