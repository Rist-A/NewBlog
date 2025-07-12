const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const SavedPost = sequelize.define("SavedPost", {
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
    onDelete: 'CASCADE' // SavedPost will be deleted if post is deleted
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // SavedPost will be deleted if user is deleted
  }
}, {
  timestamps: true,
  tableName: 'saved_posts',
  indexes: [{
    unique: true,
    fields: ['user_id', 'post_id'], // Prevents duplicate saves
    name: 'unique_save_constraint'
  }]
});

SavedPost.associate = function(models) {
  SavedPost.belongsTo(models.Post, {
    foreignKey: 'post_id',
    as: 'post'
  });

  SavedPost.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  

};

module.exports = SavedPost;