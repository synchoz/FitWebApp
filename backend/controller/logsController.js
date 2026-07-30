const weightService = require('../services/weightService');
const { toWeightDto, toWeightListDto } = require('../dto/weightDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isPositiveNumber, isValidDate } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

exports.addWeight = asyncHandler(async function (req, res) {
    const { weight, date } = req.body;

    if (weight === undefined || weight === null || !date) {
        throw new ValidationError('weight and date are required');
    }
    if (!isPositiveNumber(weight)) {
        throw new ValidationError('weight must be a positive number');
    }
    if (!isValidDate(date)) {
        throw new ValidationError('date must be a valid date');
    }

    const weightLog = await weightService.addWeight(req.userId, weight, date);

    res.status(201).json({
        message: 'Weight log added successfully',
        result: toWeightDto(weightLog),
    });
});

exports.getWeight = asyncHandler(async function (req, res) {
    const { page, limit, offset } = parsePagination(req.query);
    const { count, rows } = await weightService.getWeightsForUser(req.userId, { limit, offset });

    res.status(200).json({
        message: 'Weight logs fetched successfully',
        result: toWeightListDto(rows),
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
});
