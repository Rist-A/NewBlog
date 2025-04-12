const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const PostTags = sequelize.define("PostTags", {
  post_id: {
    type: DataTypes.UUID,
    primaryKey: false,
    allowNull: false,
    references: {
      model: 'posts',  // References the Posts table
      key: 'id'       // References the id column in Posts
    },
    onDelete: 'CASCADE' // Optional: delete association when post is deleted
  },
  tag_id: {
    type: DataTypes.UUID,
    primaryKey: false,
    allowNull: false,
    references: {
      model: 'tags',  // References the Tags table
      key: 'id'       // References the id column in Tags
    },
    onDelete: 'CASCADE' // Optional: delete association when tag is deleted
  }
}, {
  timestamps: false,
  tableName: 'post_tags', // Explicit table name (optional)
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'tag_id'] // Composite unique index
    }
  ]
});

// No need for associations here as they're handled in Tag and Post models

module.exports = PostTags;