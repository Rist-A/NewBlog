'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
 await queryInterface.createTable('posts',{
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Post title cannot be empty"
        },
        len: {
          args: [5, 100],
          msg: "Title must be between 5 and 100 characters"
        }
      }
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Post content cannot be empty"
        },
        len: {
          args: [10, 5000],
          msg: "Content must be between 10 and 5000 characters"
        }
      }
    },
    status: {
      type: Sequelize.STRING,
      defaultValue: "active",
      validate: {
        isIn: {
          args: [['active', 'inactive', 'draft']],
          msg: "Status must be either active, inactive, or draft"
        }
      }
    },
    post_image: {
      type: Sequelize.STRING,
      
    },
    author_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE' // Delete posts if author is deleted
    },
    category_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'RESTRICT' // Prevent deletion if posts exist
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
await queryInterface.dropTable('posts');
  }
};
