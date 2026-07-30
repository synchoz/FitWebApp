'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('passwordresettokens', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            tokenHash: {
                type: Sequelize.STRING(128),
                allowNull: false,
                unique: true,
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            usedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
        await queryInterface.addIndex('passwordresettokens', ['userId'], {
            name: 'passwordresettokens_userid_idx',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('passwordresettokens', 'passwordresettokens_userid_idx');
        await queryInterface.dropTable('passwordresettokens');
    },
};
