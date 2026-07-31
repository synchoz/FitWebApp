require('dotenv').config();

const useSSL = process.env.DB_SSL !== 'false';

const shared = {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: useSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
};

module.exports = {
    development: shared,
    test: shared,
    production: shared,
};
