const { Sequelize } = require('sequelize');


const sequelizeDB = new Sequelize(process.env.DBDATABASE || process.env.DB_LOCAL_DATABASE, 
                                  process.env.DBUSERNAME || process.env.DB_LOCAL_USERNAME, 
                                  process.env.DBPASSWORD || process.env.DB_LOCAL_PASSWORD ,{
    dialect: 'mysql',
    host: process.env.DBHOST
});

module.exports = sequelizeDB;