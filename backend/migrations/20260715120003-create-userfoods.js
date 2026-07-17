'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('userfoods', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            username: {
                type: Sequelize.STRING,
            },
            userfood: {
                type: Sequelize.STRING,
                references: {
                    model: 'foods',
                    key: 'food',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            amount: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('userfoods');
    },
};
