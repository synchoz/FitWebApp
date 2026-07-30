'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex('users', ['username'], {
            unique: true,
            name: 'users_username_unique',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('users', 'users_username_unique');
    },
};
