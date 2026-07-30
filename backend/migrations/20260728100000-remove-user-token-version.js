'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.removeColumn('users', 'tokenVersion');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'tokenVersion', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },
};
