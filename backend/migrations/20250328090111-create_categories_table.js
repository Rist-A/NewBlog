'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('categories',{
     id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      category_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Category name cannot be empty"
          },
          len: {
            args: [2, 50],
            msg: "Category name must be between 2 and 50 characters"
          }
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
   })
  },

  async down (queryInterface, Sequelize) {
  await queryInterface.dropTable('categories');
  }
};
