const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Post = sequelize.define("Post", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
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
    type: DataTypes.TEXT,
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
    type: DataTypes.STRING,
    defaultValue: "active",
    validate: {
      isIn: {
        args: [['active', 'inactive', 'draft']],
        msg: "Status must be either active, inactive, or draft"
      }
    }
  },
  post_image: {
    type: DataTypes.STRING,

  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // Delete posts if author is deleted
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'RESTRICT' // Prevent deletion if posts exist
  }
}, {
  timestamps: true,
  tableName: 'posts',
  paranoid: true // Enable soft deletion
});

// Post.associate = function(models) {
//   // Relationships with User
//   Post.belongsTo(models.User, {
//     foreignKey: 'author_id',
//     as: 'author',
//     onDelete: 'CASCADE'
//   });

//   // Relationships with Category
//   Post.belongsTo(models.Category, {
//     foreignKey: 'category_id',
//     as: 'category',
//     onDelete: 'RESTRICT'
//   });

//   // Relationships with Tags (many-to-many)
//   Post.belongsToMany(models.Tag, {
//     through: models.PostTags,
//     foreignKey: 'post_id',
//     otherKey: 'tag_id',
//     as: 'tags',
//     onDelete: 'CASCADE'
//   });

//   // Relationships with Comments
//   Post.hasMany(models.Comment, {
//     foreignKey: 'post_id',
//     as: 'comments',
//     onDelete: 'CASCADE'
//   });

//   // Relationships with Likes
//   Post.hasMany(models.Like, {
//     foreignKey: 'post_id',
//     as: 'likes',
//     onDelete: 'CASCADE'
//   });
// };

module.exports = Post;