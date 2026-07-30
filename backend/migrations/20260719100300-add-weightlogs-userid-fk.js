'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addConstraint('weightlogs', {
            fields: ['userid'],
            type: 'foreign key',
            name: 'weightlogs_userid_fk',
            references: { table: 'users', field: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeConstraint('weightlogs', 'weightlogs_userid_fk');
    },
};
