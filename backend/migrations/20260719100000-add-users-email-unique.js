'use strict';

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addIndex('users', ['email'], {
            unique: true,
            name: 'users_email_unique',
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeIndex('users', 'users_email_unique');
    },
};
