'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex('weightlogs', ['userid'], {
            name: 'weightlogs_userid_idx',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('weightlogs', 'weightlogs_userid_idx');
    },
};
