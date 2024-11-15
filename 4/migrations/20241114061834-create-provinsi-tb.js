'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('provinsi_tb', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references:{
          model:"users_tb",
          key:"id"
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nama: {
        type: Sequelize.STRING
      },
      diresmikan: {
        type: Sequelize.DATE
      },
      photo: {
        type: Sequelize.STRING
      },
      pulau: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('provinsi_tb');
  }
};