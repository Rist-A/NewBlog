const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: {
        msg: "Category name cannot be empty"
      },
      len: {
        args: [2, 50],
        msg: "Category name must be between 2 and 50 characters"
      }
    }
  }
}, {
  timestamps: true,
  tableName: 'categories',
  paranoid: true, // Enables soft deletion
  defaultScope: {
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'deletedAt'] 
    }
  }
});


module.exports = Category;