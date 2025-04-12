'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users',{
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        user_image: {
          type: Sequelize.STRING,
          defaultValue: 'https://res-console.cloudinary.com/docuoohjc/thumbnails/v1/image/upload/v1743067077/dXNlcmltYWdlX2Y0N2hxYg==/drilldown'
        },
        user_name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: '123e4567-e89b-12d3-a456-426614174000', 
          references: {
            model: 'user_roles',  // Corrected to match UserRole's tableName
            key: 'id'
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
    await queryInterface.dropTable('users');
  }
};
