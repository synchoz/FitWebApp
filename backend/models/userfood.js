const { DataTypes } = require('sequelize');
const sequelizeDB = require('../utils/database');
const Food = require('./food');
const User = require('./user');


const UserFood = sequelizeDB.define('userfood', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
        },
        userfood: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
    // Other model options go here
    timestamps: false,
});
/* UserFood.hasMany(Food, {foreignKey: 'food'});  */
UserFood.belongsTo(Food, {foreignKey: 'userfood'});
UserFood.belongsTo(User, { foreignKey: 'username', targetKey: 'username' });
User.hasMany(UserFood, { foreignKey: 'username', sourceKey: 'username' });

module.exports = UserFood;