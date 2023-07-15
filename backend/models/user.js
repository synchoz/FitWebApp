const { DataTypes,Model } = require('sequelize');
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
            allowNull: false
        },
        email: {
            type: DataTypes.STRING
        }
    }, {
    // Other model options go here
});

// Create a new user

module.exports = User;
//console.log(User === sequelize.models.User);