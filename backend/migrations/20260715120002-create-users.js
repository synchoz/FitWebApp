'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
            },
            hash: {
                type: Sequelize.STRING,
            },
            height: {
                type: Sequelize.DECIMAL(3, 2),
            },
            weight: {
                type: Sequelize.DECIMAL(3, 2),
            },
            age: {
                type: Sequelize.INTEGER,
            },
            address: {
                type: Sequelize.STRING,
            },
            phonenumber: {
                type: Sequelize.INTEGER,
            },
            fullname: {
                type: Sequelize.STRING,
            },
            gender: {
                type: Sequelize.STRING,
            },
            imagelink: {
                type: Sequelize.STRING,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('users');
    },
};
