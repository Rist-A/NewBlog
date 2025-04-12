'use strict';

const sequelize = require('../db');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_posts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      post_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    // Add unique composite index for user_id and post_id
    await queryInterface.addIndex('saved_posts', {
      fields: ['user_id', 'post_id'],
      unique: true,
      name: 'unique_save_constraint'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the index first to avoid errors
    await queryInterface.removeIndex('saved_posts', 'unique_save_constraint');
    
    // Then drop the table
    await queryInterface.dropTable('saved_posts');
  }
};