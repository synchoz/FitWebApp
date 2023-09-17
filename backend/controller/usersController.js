const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');


async function addUser(name, email, hash) {
    const addedUser = await User.create({ 
        username: name, 
        email: email, 
        hash: hash });
    console.log("the new id of the added user is:", addedUser.id,addedUser.hash);
    return addedUser;//its for me need to later remove it...
}

async function findUser(email) {
    return await User.findOne({ where: {email: email} });
}
/* addUser(_userName, _email); */
exports.register = async function(req, res, next) {
    const { username, email, password } = req.body;
    const saltRounds = 10;

    try {
        const hash = await bcrypt.hash(password, saltRounds);
        if(hash) {
            console.log(hash);
            const newUser = await addUser(username, email, hash);
            console.log(newUser);
            res.status(201).json({
                message: "user was created succesfully", 
                user: newUser
            });
        }
    } catch (err) {
        /* console.error(err); */
        res.status(400).json({message: "Error creating new user", error: err.message});
    }
}

exports.updateUserDetails = async function(req, res, next) {
    try {
        const {username, fullname, email, address, phonenumber, weight, gender} = req.body;
        const user = await User.findOne({where: {username: username}});

        if(user) {
            await user.update({ 
                fullname: fullname,
                email: email,
                address: address,
                phonenumber: phonenumber,
                weight: weight,
                gender: gender,
            });
            res.status(201).json({
                message: "user was updated succesfully", 
                user: user
            });
        }
    } catch (err) {
        res.status(400).json({message: "Error creating new user", error: err.message});
    }
}

exports.getUserInfo = async function(req, res, next) {
    try {
        const {username} = req.params;
        const user = await User.findOne({where: {username: username}});
        if(user) {
            console.log('succesfully loaded user');
            res.status(201).json({
                message: "succesfully user info!", 
                result: user
            })} 
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: "error",
            error: err
    })}
}

exports.validateUser = async function (req, res, next) {
    try {
        /* console.log(req.body.email); */
        const user = await findUser(req.body.email);
        if(user) {
            bcrypt
                .compare(req.body.password, user.hash)
                .then(passwordCheck => {
                    if(passwordCheck) {
                        const token = jwt.sign({id: user.id,username: user.username,},
                                                config.secret,
                                                {
                                                    algorithm: 'HS256',
                                                    allowInsecureKeySizes: true,
                                                    expiresIn: 86400, // 24 hours
                                                });
                        res.status(200).json({
                            message: "Login was successful",
                            email: user.email,
                            username: user.username,
                            accessToken: token,
                        });
                    } else {
                        res.status(400).send({
                            message: "Passwords does not match",
                        });
                    }
                })
                .catch((error) => {
                    console.log(user);
                    res.status(400).send({
                        message: "Error while comparing passwords",
                        error,
                    });
                });
        } else {
            res.status(400).send({
                message: "Email doesn't exist",
            });
        }
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    } 
};