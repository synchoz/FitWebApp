const { DataTypes } = require('sequelize');
const sequelizeDB = require('../utils/database');
const Exercise = require('./exercise');
const User = require('./user');

const UserExercise = sequelizeDB.define('userexercise', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userid: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userexercise: {
        type: DataTypes.STRING,
    },
    setnumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reps: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    weight: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
    },
    logdate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    timestamps: false,
});

UserExercise.belongsTo(Exercise, { foreignKey: 'userexercise' });
UserExercise.belongsTo(User, { foreignKey: 'userid' });
User.hasMany(UserExercise, { foreignKey: 'userid' });

module.exports = UserExercise;
