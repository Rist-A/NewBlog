'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 await queryInterface.createTable('comments',{
id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Comment content cannot be empty"
      },
      len: {
        args: [1, 2000],
        msg: "Comment must be between 1 and 2000 characters"
      }
    }
  },
  post_id: {
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE' // Delete comment when post is deleted
  },
  author_id: {  // Renamed from user_id to be more explicit
    type: Sequelize.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // Delete comment when user is deleted
  }

 })
  },

  async down (queryInterface, Sequelize) {
await queryInterface.dropTable('comments')
  }
};
