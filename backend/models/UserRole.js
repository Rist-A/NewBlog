const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const UserRole = sequelize.define("UserRole", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  role_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // assuming role names should be unique
  },
}, {
  timestamps: true,
  tableName: 'user_roles' // optional: explicit table name
});



module.exports = UserRole;