const { DataTypes } = require('sequelize');
/* const sequelize = new Sequelize('sqlite::memory:'); */
const sequelizeDB = require('../utils/database')



const User = sequelizeDB.define('user', {
        // Model attributes are defined here
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
        },
        hash: {
            type: DataTypes.STRING
        },
        height: {
            type: DataTypes.DECIMAL(5,2)
        },
        weight: {
            type: DataTypes.DECIMAL(5,2)
        },
        age: {
            type: DataTypes.INTEGER
        },
        address: {
            type: DataTypes.STRING
        },
        phonenumber: {
            type: DataTypes.INTEGER
        },
        fullname: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.STRING
        },
        imagelink: {
            type: DataTypes.STRING
        },
        failedLoginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        lockedUntil: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        },
    }, {
    // Other model options go here
});

// Create a new user

module.exports = User;
//console.log(User === sequelize.models.User);