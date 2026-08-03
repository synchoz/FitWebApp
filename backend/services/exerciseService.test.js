jest.mock('../models/exercise');

const { Op } = require('sequelize');
const Exercise = require('../models/exercise');
const exerciseService = require('./exerciseService');
const { ConflictError } = require('../errors/AppError');

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

describe('createExercise', () => {
    test('creates a new catalog entry when the name is unused', async () => {
        Exercise.findOne.mockResolvedValue(null);
        const created = { exercise: 'Cable Fly', category: 'Chest' };
        Exercise.create.mockResolvedValue(created);

        const result = await exerciseService.createExercise({ exercise: 'Cable Fly', category: 'Chest' });

        expect(Exercise.findOne).toHaveBeenCalledWith({ where: { exercise: { [Op.iLike]: 'Cable Fly' } } });
        expect(Exercise.create).toHaveBeenCalledWith({ exercise: 'Cable Fly', category: 'Chest' });
        expect(result).toBe(created);
    });

    test('rejects a name that already exists (case-insensitively)', async () => {
        Exercise.findOne.mockResolvedValue({ exercise: 'Deadlift' });

        await expect(exerciseService.createExercise({ exercise: 'deadlift', category: 'Back' }))
            .rejects.toThrow(ConflictError);
        expect(Exercise.create).not.toHaveBeenCalled();
    });
});
