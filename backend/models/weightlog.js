const { DataTypes } = require('sequelize');
const sequelizeDB = require('../utils/database');
const User = require('./user');

const WeightLog = sequelizeDB.define('weightlog', {
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
    weight: {
        type: DataTypes.INTEGER
    },
    logdate: {
        type: DataTypes.DATE,
        get: function() { // or use get(){ }
            return this.getDataValue('logdate')
                .toLocaleString('en-GB', { timeZone: 'UTC' });
        }
    }
}, {
// Other model options go here
    timestamps: false,
});

WeightLog.belongsTo(User, { foreignKey: 'userid' });
User.hasMany(WeightLog, { foreignKey: 'userid' });

module.exports = WeightLog;