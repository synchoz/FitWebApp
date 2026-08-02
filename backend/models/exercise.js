const { DataTypes } = require('sequelize');
const sequelizeDB = require('../utils/database');

const Exercise = sequelizeDB.define('exercises', {
    exercise: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
    },
}, {
    timestamps: false,
});

module.exports = Exercise;
