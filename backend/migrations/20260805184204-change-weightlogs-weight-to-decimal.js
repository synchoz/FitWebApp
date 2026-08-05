'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('weightlogs', 'weight', {
      type: Sequelize.DECIMAL(6, 2),
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('weightlogs', 'weight', {
      type: Sequelize.INTEGER,
    });
  }
};
