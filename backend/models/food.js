const { DataTypes,Model } = require('sequelize');
const sequelizeDB = require('../utils/database')


const Food = sequelizeDB.define('foods', {
       /*  id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        }, */
        food: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        proteins: {
            type: DataTypes.INTEGER
        },
        calories: {
            type: DataTypes.INTEGER
        },
        amount: {
            type: DataTypes.INTEGER
        },
        fats: {
            type: DataTypes.INTEGER
        },
        carbs: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false,
        // Other model options go here
});

module.exports = Food;