'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('userexercises', {
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
            userexercise: {
                type: Sequelize.STRING,
                references: {
                    model: 'exercises',
                    key: 'exercise',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            setnumber: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            reps: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            weight: {
                type: Sequelize.DECIMAL(6, 2),
                allowNull: true,
            },
            logdate: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('userexercises');
    },
};
