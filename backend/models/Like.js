const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Like = sequelize.define("Like", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE' // Like will be deleted if post is deleted
  },
  author_id: {  
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // Like will be deleted if user is deleted
  }
}, {
  timestamps: true,
  tableName: 'likes',
  indexes: [{
    unique: true,
    fields: ['author_id', 'post_id'], // Prevents duplicate likes
    name: 'unique_like_constraint'
  }]
});



module.exports = Like;