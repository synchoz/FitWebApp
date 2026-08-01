'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('userfoods', 'logdate', {
            type: Sequelize.DATEONLY,
            allowNull: true,
        });
        // Existing rows predate date-scoping; backfill them to today so they
        // stay visible instead of silently disappearing from every day view.
        await queryInterface.sequelize.query(
            "UPDATE userfoods SET logdate = CURRENT_DATE WHERE logdate IS NULL"
        );
        await queryInterface.changeColumn('userfoods', 'logdate', {
            type: Sequelize.DATEONLY,
            allowNull: false,
        });
    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('userfoods', 'logdate');
    },
};
