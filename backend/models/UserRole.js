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

// UserRole.associate = function(models) {
//   // Define the one-to-many relationship with User
//   UserRole.hasMany(models.User, {
//     foreignKey: 'role_id',
//     as: 'users' // optional: alias for the association
//   });
// };

module.exports = UserRole;