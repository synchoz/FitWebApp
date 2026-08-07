const userService = require('../services/userService');
const weightService = require('../services/weightService');
const foodService = require('../services/foodService');
const exerciseService = require('../services/exerciseService');
const userExerciseService = require('../services/userExerciseService');
const { toUserSummaryListDto } = require('../dto/userDto');
const { toWeightDto, toWeightListDto } = require('../dto/weightDto');
const { toFoodCatalogDto } = require('../dto/foodDto');
const { toExerciseCatalogDto, toUserExerciseDto, toUserExerciseListDto } = require('../dto/exerciseDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isPositiveNumber, isNonNegativeNumber, isValidDate } = require('../utils/validators');

function isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
}

exports.getUsers = asyncHandler(async function (req, res) {
    const users = await userService.listUsers();

    res.status(200).json({
        message: 'Successfully fetched users list',
        result: toUserSummaryListDto(users),
    });
});

exports.getUserWeightLogs = asyncHandler(async function (req, res) {
    const { userId } = req.query;

    if (!userId) {
        throw new ValidationError('userId is required');
    }

    const { rows } = await weightService.getWeightsForUser(Number(userId));

    res.status(200).json({
        message: 'Successfully fetched weight logs',
        result: toWeightListDto(rows),
    });
});

exports.updateWeightLog = asyncHandler(async function (req, res) {
    const { id, weight, date } = req.body;

    if (!id) {
        throw new ValidationError('id is required');
    }
    if (weight !== undefined && weight !== null && !isPositiveNumber(weight)) {
        throw new ValidationError('weight must be a positive number');
    }
    if (date !== undefined && date !== null && !isValidDate(date)) {
        throw new ValidationError('date must be a valid date');
    }

    const weightLog = await weightService.updateWeight(id, {
        weight: weight === undefined || weight === null ? undefined : Number(weight),
        logdate: date === undefined || date === null ? undefined : date,
    });

    res.status(200).json({
        message: 'Successfully updated weight log',
        result: toWeightDto(weightLog),
    });
});

exports.deleteWeightLog = asyncHandler(async function (req, res) {
    const { id } = req.body;

    if (!id) {
        throw new ValidationError('id is required');
    }

    await weightService.deleteWeight(id);

    res.status(200).json({
        message: 'Successfully deleted weight log',
    });
});

exports.updateFoodEntry = asyncHandler(async function (req, res) {
    const { food, calories, protein, carbs, fats, amount } = req.body;

    if (!food) {
        throw new ValidationError('food is required');
    }
    for (const [key, value] of Object.entries({ calories, protein, carbs, fats })) {
        if (value !== undefined && value !== null && !isNonNegativeNumber(value)) {
            throw new ValidationError(`${key} must be a non-negative number`);
        }
    }
    if (amount !== undefined && amount !== null && !isPositiveNumber(amount)) {
        throw new ValidationError('amount must be a positive number');
    }

    const foodRow = await foodService.updateFood(food, {
        calories: calories === undefined || calories === null ? undefined : Number(calories),
        protein: protein === undefined || protein === null ? undefined : Number(protein),
        carbs: carbs === undefined || carbs === null ? undefined : Number(carbs),
        fats: fats === undefined || fats === null ? undefined : Number(fats),
        amount: amount === undefined || amount === null ? undefined : Number(amount),
    });

    res.status(200).json({
        message: 'Successfully updated food',
        result: toFoodCatalogDto(foodRow),
    });
});

exports.deleteFoodEntry = asyncHandler(async function (req, res) {
    const { food } = req.body;

    if (!food) {
        throw new ValidationError('food is required');
    }

    await foodService.deleteFood(food);

    res.status(200).json({
        message: 'Successfully deleted food',
    });
});

exports.updateExerciseEntry = asyncHandler(async function (req, res) {
    const { exercise, category } = req.body;

    if (!exercise) {
        throw new ValidationError('exercise is required');
    }

    const exerciseRow = await exerciseService.updateExercise(exercise, {
        category: category === undefined ? undefined : category,
    });

    res.status(200).json({
        message: 'Successfully updated exercise',
        result: toExerciseCatalogDto(exerciseRow),
    });
});

exports.deleteExerciseEntry = asyncHandler(async function (req, res) {
    const { exercise } = req.body;

    if (!exercise) {
        throw new ValidationError('exercise is required');
    }

    await exerciseService.deleteExercise(exercise);

    res.status(200).json({
        message: 'Successfully deleted exercise',
    });
});

exports.getUserExerciseLog = asyncHandler(async function (req, res) {
    const { userId } = req.query;

    if (!userId) {
        throw new ValidationError('userId is required');
    }

    const { rows } = await userExerciseService.getUserExerciseList(Number(userId));

    res.status(200).json({
        message: 'Successfully fetched exercise log',
        result: toUserExerciseListDto(rows),
    });
});

exports.updateExerciseLog = asyncHandler(async function (req, res) {
    const { id, reps, weight } = req.body;

    if (!id) {
        throw new ValidationError('id is required');
    }
    if (reps !== undefined && reps !== null && !isPositiveInteger(reps)) {
        throw new ValidationError('reps must be a positive integer');
    }
    if (weight !== undefined && weight !== null && weight !== '' && !isPositiveNumber(weight)) {
        throw new ValidationError('weight must be a positive number');
    }

    const userExercise = await userExerciseService.adminUpdateUserExercise(id, {
        reps: reps === undefined || reps === null ? undefined : Number(reps),
        weight: weight === undefined ? undefined : (weight === null || weight === '' ? null : Number(weight)),
    });

    res.status(200).json({
        message: 'Successfully updated exercise log entry',
        result: toUserExerciseDto(userExercise),
    });
});

exports.deleteExerciseLog = asyncHandler(async function (req, res) {
    const { id } = req.body;

    if (!id) {
        throw new ValidationError('id is required');
    }

    await userExerciseService.adminDeleteUserExercise(id);

    res.status(200).json({
        message: 'Successfully deleted exercise log entry',
    });
});
