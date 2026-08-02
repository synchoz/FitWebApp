jest.mock('../models/exercise');

const Exercise = require('../models/exercise');
const exerciseService = require('./exerciseService');

beforeEach(() => {
    jest.clearAllMocks();
});

test('getExercisesList fetches only the catalog columns the DTO needs', async () => {
    const exercises = [{ exercise: 'Barbell Bench Press' }, { exercise: 'Deadlift' }];
    Exercise.findAll.mockResolvedValue(exercises);

    const result = await exerciseService.getExercisesList();

    expect(Exercise.findAll).toHaveBeenCalledWith({
        attributes: ['exercise', 'category'],
    });
    expect(result).toBe(exercises);
});
