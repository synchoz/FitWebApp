'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'height', {
            type: Sequelize.DECIMAL(5, 2),
        });
        await queryInterface.changeColumn('users', 'weight', {
            type: Sequelize.DECIMAL(5, 2),
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('users', 'height', {
            type: Sequelize.DECIMAL(3, 2),
        });
        await queryInterface.changeColumn('users', 'weight', {
            type: Sequelize.DECIMAL(3, 2),
        });
    },
};
