// Exercise is a real Sequelize model here (spied on, not jest.mock'd) because
// models/userexercise.js calls UserExercise.belongsTo(Exercise, ...) at import time, which
// requires Exercise to actually be a Model subclass rather than an automock.
jest.mock('../models/userexercise');

const UserExercise = require('../models/userexercise');
const Exercise = require('../models/exercise');
const userExerciseService = require('./userExerciseService');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Exercise, 'findByPk').mockResolvedValue(null);
});

afterEach(() => {
    Exercise.findByPk.mockRestore();
});

test('getUserExerciseList scopes to the userid, includes the exercise catalog association, and applies pagination', async () => {
    const found = { count: 1, rows: [{ id: 1 }] };
    UserExercise.findAndCountAll.mockResolvedValue(found);

    const result = await userExerciseService.getUserExerciseList(1, { limit: 100, offset: 0 });

    expect(UserExercise.findAndCountAll).toHaveBeenCalledWith({
        where: { userid: 1 },
        include: [{ model: Exercise }],
        order: [['userexercise', 'ASC'], ['setnumber', 'ASC']],
        limit: 100,
        offset: 0,
    });
    expect(result).toBe(found);
});

test('getUserExerciseList scopes to a specific logdate when provided', async () => {
    const found = { count: 1, rows: [{ id: 1 }] };
    UserExercise.findAndCountAll.mockResolvedValue(found);

    await userExerciseService.getUserExerciseList(1, { limit: 100, offset: 0, logdate: '2026-08-01' });

    expect(UserExercise.findAndCountAll).toHaveBeenCalledWith({
        where: { userid: 1, logdate: '2026-08-01' },
        include: [{ model: Exercise }],
        order: [['userexercise', 'ASC'], ['setnumber', 'ASC']],
        limit: 100,
        offset: 0,
    });
});

describe('addUserExercise', () => {
    test('rejects with NotFoundError when the exercise is not in the catalog', async () => {
        Exercise.findByPk.mockResolvedValue(null);

        await expect(userExerciseService.addUserExercise(1, 'Unobtainium Curl', 10, 20, '2026-08-01'))
            .rejects.toBeInstanceOf(NotFoundError);
        expect(UserExercise.create).not.toHaveBeenCalled();
    });

    test('assigns setnumber 1 for the first set of an exercise on a given day', async () => {
        Exercise.findByPk.mockResolvedValue({ exercise: 'Barbell Curl' });
        UserExercise.max.mockResolvedValue(null);
        const created = { id: 1 };
        UserExercise.create.mockResolvedValue(created);

        const result = await userExerciseService.addUserExercise(1, 'Barbell Curl', 10, 20, '2026-08-01');

        expect(UserExercise.max).toHaveBeenCalledWith('setnumber', {
            where: { userid: 1, userexercise: 'Barbell Curl', logdate: '2026-08-01' },
        });
        expect(UserExercise.create).toHaveBeenCalledWith({
            userid: 1,
            userexercise: 'Barbell Curl',
            setnumber: 1,
            reps: 10,
            weight: 20,
            logdate: '2026-08-01',
        });
        expect(result).toBe(created);
    });

    test('increments setnumber for a repeated set of the same exercise on the same day', async () => {
        Exercise.findByPk.mockResolvedValue({ exercise: 'Barbell Curl' });
        UserExercise.max.mockResolvedValue(2);
        UserExercise.create.mockResolvedValue({ id: 3 });

        await userExerciseService.addUserExercise(1, 'Barbell Curl', 8, 22.5, '2026-08-01');

        expect(UserExercise.create).toHaveBeenCalledWith(expect.objectContaining({ setnumber: 3 }));
    });
});

describe('ownership checks (via update/delete)', () => {
    test('updateUserExercise rejects with NotFoundError when the row does not exist', async () => {
        UserExercise.findOne.mockResolvedValue(null);

        await expect(userExerciseService.updateUserExercise(1, 1, { reps: 8 }))
            .rejects.toBeInstanceOf(NotFoundError);
    });

    test('updateUserExercise rejects with ForbiddenError when the row belongs to someone else', async () => {
        UserExercise.findOne.mockResolvedValue({ id: 1, userid: 2 });

        await expect(userExerciseService.updateUserExercise(1, 1, { reps: 8 }))
            .rejects.toBeInstanceOf(ForbiddenError);
    });

    test('updateUserExercise only updates the provided fields', async () => {
        const row = { id: 1, userid: 1, update: jest.fn().mockResolvedValue(undefined) };
        UserExercise.findOne.mockResolvedValue(row);

        const result = await userExerciseService.updateUserExercise(1, 1, { reps: 8 });

        expect(row.update).toHaveBeenCalledWith({ reps: 8 });
        expect(result).toBe(row);
    });

    test('deleteUserExercise destroys the row when owned by the caller', async () => {
        const row = { id: 1, userid: 1, destroy: jest.fn().mockResolvedValue(undefined) };
        UserExercise.findOne.mockResolvedValue(row);

        const result = await userExerciseService.deleteUserExercise(1, 1);

        expect(row.destroy).toHaveBeenCalled();
        expect(result).toBe(row);
    });

    test('deleteUserExercise rejects with ForbiddenError when the row belongs to someone else', async () => {
        UserExercise.findOne.mockResolvedValue({ id: 1, userid: 2, destroy: jest.fn() });

        await expect(userExerciseService.deleteUserExercise(1, 1)).rejects.toBeInstanceOf(ForbiddenError);
    });
});

describe('copyExerciseLog', () => {
    test('rejects with NotFoundError when the source date has no logged sets', async () => {
        UserExercise.findAll.mockResolvedValue([]);

        await expect(userExerciseService.copyExerciseLog(1, '2026-07-30', '2026-08-01'))
            .rejects.toBeInstanceOf(NotFoundError);
        expect(UserExercise.bulkCreate).not.toHaveBeenCalled();
    });

    test('duplicates each set from the source date onto the target date', async () => {
        const sourceRows = [
            { userexercise: 'Barbell Squat', setnumber: 1, reps: 5, weight: 100 },
            { userexercise: 'Barbell Squat', setnumber: 2, reps: 5, weight: 100 },
        ];
        UserExercise.findAll
            .mockResolvedValueOnce(sourceRows)
            .mockResolvedValueOnce([{ id: 10 }, { id: 11 }]);
        UserExercise.bulkCreate.mockResolvedValue([{ id: 10 }, { id: 11 }]);

        await userExerciseService.copyExerciseLog(1, '2026-07-30', '2026-08-01');

        expect(UserExercise.bulkCreate).toHaveBeenCalledWith(
            [
                { userid: 1, userexercise: 'Barbell Squat', setnumber: 1, reps: 5, weight: 100, logdate: '2026-08-01' },
                { userid: 1, userexercise: 'Barbell Squat', setnumber: 2, reps: 5, weight: 100, logdate: '2026-08-01' },
            ],
            { returning: true },
        );
    });
});
