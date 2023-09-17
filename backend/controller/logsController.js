const WeightLog = require('../models/weightlog');
const User = require('../models/user');

async function addWeight(username, weight, date) {
    const user = await User.findOne({ where: { username: username } });
    if(user) {
        const addedWeightLog = WeightLog.create({
            userid: user.id,
            weight: weight,
            logdate: date,
        });

        return addedWeightLog;
    }
}

async function getWeight(username) {
    const user = await User.findOne({ where: { username: username } });
    if(user) {
        const result = await WeightLog.findAll({
            where: {userid: user.id},
            order: [["logdate", "ASC"]],});
        //console.log(result);
        var weights = result.map(weightlog => weightlog.dataValues.weight);
        var dates = result.map(weightlog => weightlog.dataValues.logdate);
        //const data = result.map((log) => { log => log.weightlog.dataValues.weight});
        console.log(weights);
        console.log(dates);
        return result;
    }
}

exports.getWeight = async function (req, res, next) {
    const {username} = req.params;
    //console.log(userid);

    try {
        const weightsPerUser = await getWeight(username);
        console.log('succesfully loaded weights for the user ', weightsPerUser);
        res.status(201).json({
            message: "succesfully fetched weights for the user", 
            result: weightsPerUser
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "error",
            error: err
        })
    }
}

exports.addWeight = async function(req, res, next) {
    const {username, weight, date} = req.body;

    try {
        const added = await addWeight(username, weight, date);
        console.log('succesfully added new weight log:LIES! ', added);
        res.status(201).json({
            message: "succesfully added new weight log", 
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