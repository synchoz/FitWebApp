'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('foods', {
            food: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            protein: {
                type: Sequelize.INTEGER,
            },
            calories: {
                type: Sequelize.INTEGER,
            },
            amount: {
                type: Sequelize.INTEGER,
            },
            fats: {
                type: Sequelize.INTEGER,
            },
            carbs: {
                type: Sequelize.INTEGER,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('foods');
    },
};
