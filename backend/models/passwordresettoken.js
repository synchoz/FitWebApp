const { DataTypes } = require('sequelize');
const sequelizeDB = require('../utils/database');
const User = require('./user');

const PasswordResetToken = sequelizeDB.define('passwordresettoken', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tokenHash: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    updatedAt: false,
});

PasswordResetToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(PasswordResetToken, { foreignKey: 'userId' });

module.exports = PasswordResetToken;
