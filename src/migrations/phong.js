'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'Rooms',
      {
        roomID: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING,
        },
        typeID: {
          allowNull: false,
          foreignKey: true,
          type: Sequelize.STRING,
        },
        floor: {
          type: Sequelize.INTEGER,
        },
        status: {
          type: Sequelize.STRING,
        },
        checkin: {
          type: Sequelize.DATE,
        },
        checkout: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
      },
      { define: { freezeTableName: true } }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Rooms');
  },
};
