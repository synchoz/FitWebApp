const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelizeDB = new Sequelize(process.env.DB_LOGIN, process.env.DB_USERNAME, process.env.DB_PASSWORD,{
    dialect: 'mysql',
    host:'localhost',
});

module.exports = sequelizeDB;