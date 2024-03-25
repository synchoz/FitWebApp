const express = require('express');
const usersController = require('../controller/usersController');
const logsController = require('../controller/logsController');
const foodsController = require('../controller/foodsController');
const router = express.Router();
const multer = require('multer');
const path = require('path');

function generateRandomString(length = 5) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'image/')
    },
    filename: (req, file, cb) => {
        cb(null, generateRandomString() + path.extname(file.originalname))
    },
})

const upload = multer({ storage: storage })

router.post('/addWeight', logsController.addWeight);

router.post('/addUserFood', foodsController.addUserFood);

router.post('/deleteUserFood', foodsController.deleteUserFood);

router.post('/register', usersController.register);

router.post('/login', usersController.validateUser);

router.post('/updateUserFood', foodsController.updateUserFoodAmount);

router.post('/updateUserDetails', usersController.updateUserDetails);

router.post('/upload', upload.single('file'), usersController.uploadImage);

//router.post('/uploadImage', usersController.uploadImage);

router.get('/getWeight/:username', logsController.getWeight);

router.get('/getUserInfo/:username', usersController.getUserInfo);

router.get('/getUserFoodList/:username', foodsController.getUserFoodList);

router.get('/getFoodsList', foodsController.getFoodsList);

module.exports = router;