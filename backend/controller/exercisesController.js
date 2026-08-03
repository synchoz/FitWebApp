const exerciseService = require('../services/exerciseService');
const userExerciseService = require('../services/userExerciseService');
const exerciseImportService = require('../services/exerciseImportService');
const { toExerciseCatalogListDto, toExerciseCatalogDto, toUserExerciseDto, toUserExerciseListDto } = require('../dto/exerciseDto');
const asyncHandler = require('../utils/asyncHandler');
const { ValidationError } = require('../errors/AppError');
const { isPositiveNumber, isValidDate } = require('../utils/validators');
const { parsePagination } = require('../utils/pagination');

function isPositiveInteger(value) {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
}

exports.getExercisesList = asyncHandler(async function (req, res) {
    const exercises = await exerciseService.getExercisesList();

    res.status(200).json({
        message: 'Successfully fetched exercises list',
        result: toExerciseCatalogListDto(exercises),
    });
});

exports.addExercise = asyncHandler(async function (req, res) {
    const { exercise, category } = req.body;

    if (!exercise || typeof exercise !== 'string' || !exercise.trim()) {
        throw new ValidationError('exercise name is required');
    }

    const newExercise = await exerciseService.createExercise({
        exercise: exercise.trim(),
        category: typeof category === 'string' && category.trim() ? category.trim() : 'Custom',
    });

    res.status(201).json({
        message: 'Successfully added new exercise',
        result: toExerciseCatalogDto(newExercise),
    });
});

exports.getUserExerciseList = asyncHandler(async function (req, res) {
    const { page, limit, offset } = parsePagination(req.query);
    const { date } = req.query;
    if (date && !isValidDate(date)) {
        throw new ValidationError('date must be a valid date');
    }

    const { count, rows } = await userExerciseService.getUserExerciseList(req.userId, { limit, offset, logdate: date });

    res.status(200).json({
        message: 'Successfully fetched user exercise list',
        result: toUserExerciseListDto(rows),
        pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
});

exports.addUserExercise = asyncHandler(async function (req, res) {
    const { exercise, reps, weight, date } = req.body;

    if (!exercise || reps === undefined || reps === null || !date) {
        throw new ValidationError('exercise, reps, and date are required');
    }
    if (!isPositiveInteger(reps)) {
        throw new ValidationError('reps must be a positive integer');
    }
    if (weight !== undefined && weight !== null && weight !== '' && !isPositiveNumber(weight)) {
        throw new ValidationError('weight must be a positive number');
    }
    if (!isValidDate(date)) {
        throw new ValidationError('date must be a valid date');
    }

    const normalizedWeight = weight === undefined || weight === null || weight === '' ? null : Number(weight);
    const userExercise = await userExerciseService.addUserExercise(req.userId, exercise, Number(reps), normalizedWeight, date);

    res.status(201).json({
        message: 'Successfully added exercise set',
        result: toUserExerciseDto(userExercise),
    });
});

exports.updateUserExercise = asyncHandler(async function (req, res) {
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

    const updates = {};
    if (reps !== undefined && reps !== null) {
        updates.reps = Number(reps);
    }
    if (weight !== undefined) {
        updates.weight = weight === null || weight === '' ? null : Number(weight);
    }

    const userExercise = await userExerciseService.updateUserExercise(id, req.userId, updates);

    res.status(200).json({
        message: 'Successfully updated exercise set',
        result: toUserExerciseDto(userExercise),
    });
});

exports.deleteUserExercise = asyncHandler(async function (req, res) {
    const { id } = req.body;

    if (!id) {
        throw new ValidationError('id is required');
    }

    const userExercise = await userExerciseService.deleteUserExercise(id, req.userId);

    res.status(200).json({
        message: 'Successfully deleted exercise set',
        result: toUserExerciseDto(userExercise),
    });
});

exports.previewWhatsappImport = asyncHandler(async function (req, res) {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
        throw new ValidationError('text is required');
    }

    const result = await exerciseImportService.previewWhatsappImport(text);

    res.status(200).json({
        message: 'Successfully parsed exercise import',
        result,
    });
});

exports.copyExerciseLog = asyncHandler(async function (req, res) {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
        throw new ValidationError('fromDate and toDate are required');
    }
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
        throw new ValidationError('fromDate and toDate must be valid dates');
    }

    const userExercises = await userExerciseService.copyExerciseLog(req.userId, fromDate, toDate);

    res.status(201).json({
        message: 'Successfully copied exercise log',
        result: toUserExerciseListDto(userExercises),
    });
});
