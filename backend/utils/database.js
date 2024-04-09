const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelizeDB = new Sequelize(process.env.DB_REMOTE_DATABASE, process.env.DB_REMOTE_USERNAME, process.env.DB_REMOTE_PASSWORD,{
    dialect: 'mysql',
    host: process.env.DB_REMOTE_HOST
});

module.exports = sequelizeDB;