'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      device_token: {
        type: Sequelize.TEXT
      },
      device_id: {
        type: Sequelize.TEXT
      },
      device_os: {
        type: Sequelize.STRING
      },
      brand_name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      access_token: {
        type: Sequelize.TEXT
      },
      refresh_token: {
        type: Sequelize.TEXT
      },
      date_of_birth: {
        type: Sequelize.DATEONLY
      },
      mobile_number: {
        type: Sequelize.STRING
      },
      downloaded_from: {
        type: Sequelize.STRING
      },
      app_version: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};