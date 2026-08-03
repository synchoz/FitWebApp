const foodService = require('../services/foodService');
const userFoodService = require('../services/userFoodService');
const { toFoodCatalogListDto, toFoodCatalogDto, toUserFoodDto, toUserFoodListDto } = require('../dto/foodDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isPositiveNumber, isNonNegativeNumber, isValidDate } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

exports.getFoodsList = asyncHandler(async function (req, res) {
    const foods = await foodService.getFoodsList();

    res.status(200).json({
        message: 'Successfully fetched foods list',
        result: toFoodCatalogListDto(foods),
    });
});

exports.addFood = asyncHandler(async function (req, res) {
    const { food, calories, protein, carbs, fats, amount } = req.body;

    if (!food || typeof food !== 'string' || !food.trim()) {
        throw new ValidationError('food name is required');
    }
    if (!isPositiveNumber(amount)) {
        throw new ValidationError('amount must be a positive number');
    }
    for (const [key, value] of Object.entries({ calories, protein, carbs, fats })) {
        if (!isNonNegativeNumber(value)) {
            throw new ValidationError(`${key} must be a non-negative number`);
        }
    }

    const newFood = await foodService.createFood({
        food: food.trim(),
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
        amount: Number(amount),
    });

    res.status(201).json({
        message: 'Successfully added new food',
        result: toFoodCatalogDto(newFood),
    });
});

exports.getUserFoodList = asyncHandler(async function (req, res) {
    const { page, limit, offset } = parsePagination(req.query);
    const { date } = req.query;
    if (date && !isValidDate(date)) {
        throw new ValidationError('date must be a valid date');
    }

    const { count, rows } = await userFoodService.getUserFoodList(req.username, { limit, offset, logdate: date });

    res.status(200).json({
        message: 'Successfully fetched user food list',
        result: toUserFoodListDto(rows),
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
});

exports.addUserFood = asyncHandler(async function (req, res) {
    const { food, amount, date } = req.body;

    if (!food || amount === undefined || amount === null || !date) {
        throw new ValidationError('food, amount, and date are required');
    }
    if (!isPositiveNumber(amount)) {
        throw new ValidationError('amount must be a positive number');
    }
    if (!isValidDate(date)) {
        throw new ValidationError('date must be a valid date');
    }

    const userFood = await userFoodService.addUserFood(req.username, food, amount, date);

    res.status(201).json({
        message: 'Successfully added new food log',
        result: toUserFoodDto(userFood),
    });
});

exports.updateUserFoodAmount = asyncHandler(async function (req, res) {
    const { id, amount } = req.body;

    if (!id || amount === undefined || amount === null) {
        throw new ValidationError('id and amount are required');
    }
    if (!isPositiveNumber(amount)) {
        throw new ValidationError('amount must be a positive number');
    }

    const userFood = await userFoodService.updateUserFoodAmount(id, req.username, amount);

    res.status(200).json({
        message: 'Successfully updated food amount',
        result: toUserFoodDto(userFood),
    });
});

exports.deleteUserFood = asyncHandler(async function (req, res) {
    const { id } = req.body;

    if (!id) {
        throw new ValidationError('id is required');
    }

    const userFood = await userFoodService.deleteUserFood(id, req.username);

    res.status(200).json({
        message: 'Successfully deleted food',
        result: toUserFoodDto(userFood),
    });
});
