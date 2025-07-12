const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_image: {
    type: DataTypes.STRING,
    defaultValue: 'https://res-console.cloudinary.com/docuoohjc/thumbnails/v1/image/upload/v1743067077/dXNlcmltYWdlX2Y0N2hxYg==/drilldown'
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: '123e4567-e89b-12d3-a456-426614174000', 
    references: {
      model: 'user_roles',  
      key: 'id'
    }
  }
}, {
  
  tableName: 'users'
});


module.exports = User;