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



module.exports = Tag;