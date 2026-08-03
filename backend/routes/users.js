const express = require('express');
const usersController = require('../controller/usersController');
const logsController = require('../controller/logsController');
const foodsController = require('../controller/foodsController');
const exercisesController = require('../controller/exercisesController');
const { verifyToken } = require('../middleware/authJwt');
const { authLimiter } = require('../middleware/rateLimiters');
const { ValidationError } = require('../errors/AppError');
const router = express.Router();
const multer = require('multer');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new ValidationError('Only JPEG, PNG, or WEBP images are allowed'));
        }
        cb(null, true);
    },
});

// Public routes
router.post('/register', authLimiter, usersController.register);
router.post('/login', authLimiter, usersController.validateUser);
router.post('/refresh-token', authLimiter, usersController.refreshToken);
router.post('/forgot-password', authLimiter, usersController.forgotPassword);
router.post('/reset-password', authLimiter, usersController.resetPassword);
router.get('/getFoodsList', foodsController.getFoodsList);
router.get('/getExercisesList', exercisesController.getExercisesList);

// Protected routes - identity comes from the verified JWT (req.userId / req.username),
// not from client-supplied usernames/params.
router.post('/addWeight', verifyToken, logsController.addWeight);
router.get('/getWeight', verifyToken, logsController.getWeight);

router.post('/addFood', verifyToken, foodsController.addFood);
router.post('/addUserFood', verifyToken, foodsController.addUserFood);
router.post('/deleteUserFood', verifyToken, foodsController.deleteUserFood);
router.post('/updateUserFood', verifyToken, foodsController.updateUserFoodAmount);
router.get('/getUserFoodList', verifyToken, foodsController.getUserFoodList);

router.post('/addExercise', verifyToken, exercisesController.addExercise);
router.post('/addUserExercise', verifyToken, exercisesController.addUserExercise);
router.post('/deleteUserExercise', verifyToken, exercisesController.deleteUserExercise);
router.post('/updateUserExercise', verifyToken, exercisesController.updateUserExercise);
router.get('/getUserExerciseList', verifyToken, exercisesController.getUserExerciseList);
router.post('/copyExerciseLog', verifyToken, exercisesController.copyExerciseLog);
router.post('/parseWhatsappExercises', verifyToken, exercisesController.previewWhatsappImport);

router.post('/logout', verifyToken, usersController.logout);
router.get('/getUserInfo', verifyToken, usersController.getUserInfo);
router.post('/updateUserDetails', verifyToken, usersController.updateUserDetails);
router.post('/upload', verifyToken, upload.single('file'), usersController.uploadImage);

module.exports = router;
