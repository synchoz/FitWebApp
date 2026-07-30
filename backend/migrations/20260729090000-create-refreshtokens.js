'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('refreshtokens', {
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
            revokedAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
        await queryInterface.addIndex('refreshtokens', ['userId'], {
            name: 'refreshtokens_userid_idx',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('refreshtokens', 'refreshtokens_userid_idx');
        await queryInterface.dropTable('refreshtokens');
    },
};
