const { Sequelize } = require('sequelize');

const useSSL = process.env.DB_SSL !== 'false';

const sequelizeDB = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

module.exports = sequelizeDB;
