'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 await queryInterface.createTable('post_tags',{
  post_id: {
    type: Sequelize.UUID,
    primaryKey: false,
    allowNull: false,
    references: {
      model: 'posts',  // References the Posts table
      key: 'id'       // References the id column in Posts
    },
    onDelete: 'CASCADE' // Optional: delete association when post is deleted
  },
  tag_id: {
    type: Sequelize.UUID,
    primaryKey: false,
    allowNull: false,
    references: {
      model: 'tags',  // References the Tags table
      key: 'id'       // References the id column in Tags
    },
    onDelete: 'CASCADE' // Optional: delete association when tag is deleted
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
  await queryInterface.dropTable('post_tags')
  }
};
