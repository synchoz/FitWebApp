const foodService = require('../services/foodService');
const userFoodService = require('../services/userFoodService');
const { toFoodCatalogListDto, toUserFoodDto, toUserFoodListDto } = require('../dto/foodDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isPositiveNumber } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

exports.getFoodsList = asyncHandler(async function (req, res) {
    const foods = await foodService.getFoodsList();

    res.status(200).json({
        message: 'Successfully fetched foods list',
        result: toFoodCatalogListDto(foods),
    });
});

exports.getUserFoodList = asyncHandler(async function (req, res) {
    const { page, limit, offset } = parsePagination(req.query);
    const { count, rows } = await userFoodService.getUserFoodList(req.username, { limit, offset });

    res.status(200).json({
        message: 'Successfully fetched user food list',
        result: toUserFoodListDto(rows),
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
});

exports.addUserFood = asyncHandler(async function (req, res) {
    const { food, amount } = req.body;

    if (!food || amount === undefined || amount === null) {
        throw new ValidationError('food and amount are required');
    }
    if (!isPositiveNumber(amount)) {
        throw new ValidationError('amount must be a positive number');
    }

    const userFood = await userFoodService.addUserFood(req.username, food, amount);

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
