'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex('userfoods', ['username'], {
            name: 'userfoods_username_idx',
        });
        await queryInterface.addConstraint('userfoods', {
            fields: ['username'],
            type: 'foreign key',
            name: 'userfoods_username_fk',
            references: { table: 'users', field: 'username' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeConstraint('userfoods', 'userfoods_username_fk');
        await queryInterface.removeIndex('userfoods', 'userfoods_username_idx');
    },
};
