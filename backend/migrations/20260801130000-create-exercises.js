'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('exercises', {
            exercise: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            category: {
                type: Sequelize.STRING,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('exercises');
    },
};
