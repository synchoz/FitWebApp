require('dotenv').config();

const shared = {
    username: process.env.DBUSERNAME || process.env.DB_LOCAL_USERNAME,
    password: process.env.DBPASSWORD || process.env.DB_LOCAL_PASSWORD,
    database: process.env.DBDATABASE || process.env.DB_LOCAL_DATABASE,
    host: process.env.DBHOST,
    dialect: 'mysql',
};

module.exports = {
    development: shared,
    test: shared,
    production: shared,
};
