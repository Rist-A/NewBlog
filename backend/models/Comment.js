const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
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
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE' // Delete comment when post is deleted
  },
  author_id: {  // Renamed from user_id to be more explicit
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // Delete comment when user is deleted
  }
}, {
  timestamps: true,
  tableName: 'comments',
  //paranoid: true // Optional: enables soft deletion
});

// Comment.associate = function(models) {
//   Comment.belongsTo(models.Post, {
//     foreignKey: 'post_id',
//     as: 'post',
//     onDelete: 'CASCADE'
//   });

//   Comment.belongsTo(models.User, {
//     foreignKey: 'author_id',
//     as: 'author',
//     onDelete: 'CASCADE'
//   });
// };

module.exports = Comment;