'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('weightlogs', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            userid: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            weight: {
                type: Sequelize.INTEGER,
            },
            logdate: {
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('weightlogs');
    },
};
