const Food = require('../models/food');
const UserFood = require('../models/userfood');
const User = require('../models/user');

async function getFoodsList() {
    const list = await Food.findAll({
        attributes: ['id','food', 'amount','protein','carbs','fats','calories']
    });
    return list
}


async function updateUserFoodAmount(foodId, newAmount) {
    const food = await UserFood.findOne({ where: {id: foodId}});
    if(food) {
        await food.update({ amount: newAmount});
        return food;
    }
}

exports.updateUserFoodAmount = async function(req, res, next) {
    const {id, amount} = req.body;

    try {
        const added = await updateUserFoodAmount(id, amount);
        console.log('succesfully updated food amount', added);
        res.status(201).json({
            message: "succesfully updated food amount", 
            user: added
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "error",
            error: err
        })
    }
}

exports.deleteUserFood = async function(req, res, next) {
    const {id} = req.body;
    try {
        const foodToRemove = await UserFood.destroy({where: {id: id}})
        if(foodToRemove){
            console.log('succesfully deleted food', foodToRemove);
            res.status(201).json({
                message: "succesfully deleted food", 
                user: foodToRemove
            });
        }
        
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "error",
            error: err
        })
    }
}

async function addUserFood(username, food, amount) {
    console.log(username);
    const user = await User.findOne({ where: { username: username } });
    if(user) {
        const addedUserFood = UserFood.create({
            username: user.username,
            userfood: food,
            amount: amount,
        });

        return addedUserFood;
    }
}

exports.addUserFood = async function(req, res, next) {
    const {username, food, amount} = req.body;

    try {
        const added = await addUserFood(username, food, amount);
        console.log('succesfully added new food log', added);
        res.status(201).json({
            message: "succesfully added new food log", 
            user: added
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "error",
            error: err
        })
    }
}

exports.getUserFoodList = async function (req, res, next) {
    const {username} = req.params;
    const user = await User.findOne({ where: { username: username } });
    if(user) {
        try {
           
            const foods = await UserFood.findAll({
                where: {username: username},
                include: [{
                  model: Food,
                 }]
              })/* .then(posts => {
              }); */
              
          /*   const foods = await UserFood.findAll({
                attributes: ['id','food', 'amount','protein','carbs','fats','calories'],
                where: { username: username },
            })
            const foods = await getFoodsList(); */
            console.log('succesfully loaded foods');
            res.status(201).json({
                message: "succesfully fetched foods list!", 
                result: foods
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({
                message: "error",
                error: err
            })
        }
    }
    
}

exports.getFoodsList = async function (req, res, next) {
    try {
        const foods = await getFoodsList();
        console.log('succesfully loaded foods');
        res.status(201).json({
            message: "succesfully fetched foods list!", 
            result: foods
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "error",
            error: err
        })
    }
}