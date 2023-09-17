const express = require('express');
const usersController = require('../controller/usersController');
const logsController = require('../controller/logsController');
const foodsController = require('../controller/foodsController');
const router = express.Router();

router.post('/addWeight', logsController.addWeight);

router.post('/addUserFood', foodsController.addUserFood);

router.post('/deleteUserFood', foodsController.deleteUserFood);

router.post('/register', usersController.register);

router.post('/login', usersController.validateUser);

router.post('/updateUserFood', foodsController.updateUserFoodAmount);

router.post('/updateUserDetails', usersController.updateUserDetails);

router.get('/getWeight/:username', logsController.getWeight);

router.get('/getUserInfo/:username', usersController.getUserInfo);

router.get('/getUserFoodList/:username', foodsController.getUserFoodList);

router.get('/getFoodsList', foodsController.getFoodsList);

module.exports = router;