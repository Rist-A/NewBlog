// models/ChatMessage.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

    const ChatMessage = sequelize.define('ChatMessage', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reply: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    }, {
      tableName: 'chat_messages',
      timestamps: true,
    });
  
    
  
module.exports = ChatMessage;