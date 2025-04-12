const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Tag = sequelize.define("Tag", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tag_name: {  // Changed from 'name' to 'tag_name'
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true  // Ensures the tag_name isn't empty
    }
  }
}, {
  timestamps: true,
  tableName: 'tags'  // Optional explicit table name
});

// Define the many-to-many association with Post
// Tag.associate = function(models) {
//   // A Tag can belong to many Posts through the PostTags junction table
//   Tag.belongsToMany(models.Post, {
//     through: 'PostTags',  // Name of the junction table
//     foreignKey: 'tag_id',  // Foreign key in the junction table pointing to Tag
//     otherKey: 'post_id',   // Foreign key in the junction table pointing to Post
//     as: 'posts'  // Optional alias for when eager loading
//   });
// };

module.exports = Tag;