const userService = require('../services/userService');
const weightService = require('../services/weightService');
const foodService = require('../services/foodService');
const exerciseService = require('../services/exerciseService');
const { toUserSummaryListDto } = require('../dto/userDto');
const { toWeightDto, toWeightListDto } = require('../dto/weightDto');
const { toFoodCatalogDto } = require('../dto/foodDto');
const { toExerciseCatalogDto } = require('../dto/exerciseDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isPositiveNumber, isNonNegativeNumber, isValidDate } = require('../utils/validators');

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
