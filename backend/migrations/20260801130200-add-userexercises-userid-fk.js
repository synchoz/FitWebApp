'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex('userexercises', ['userid'], {
            name: 'userexercises_userid_idx',
        });
        await queryInterface.addConstraint('userexercises', {
            fields: ['userid'],
            type: 'foreign key',
            name: 'userexercises_userid_fk',
            references: { table: 'users', field: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeConstraint('userexercises', 'userexercises_userid_fk');
        await queryInterface.removeIndex('userexercises', 'userexercises_userid_idx');
    },
};
