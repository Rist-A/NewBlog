const  ChatMessage = require('../models/ChatMessage'); // Assuming you've set up your model
const jwt = require('jsonwebtoken');

const chatMessageController = {
  // Create a new message
  createMessage: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { content } = req.body;

      const newMessage = await ChatMessage.create({
        senderId: decoded.id, // Get from token
        content,
        reply: null, // Default null
        isRead: false // Default false
      });

      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update message reply
  updateReply: async (req, res) => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      const message = await ChatMessage.findByPk(id);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      message.reply = reply;
      await message.save();

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a message (only by sender)
  deleteMessage: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id } = req.params;

      const message = await ChatMessage.findOne({
        where: {
          id,
          senderId: decoded.id // Only allow sender to delete
        }
      });

      if (!message) {
        return res.status(404).json({ 
          error: 'Message not found or unauthorized' 
        });
      }

      await message.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all messages (for authenticated user)
  getAllMessages: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const messages = await ChatMessage.findAll({
        where: {
          senderId: decoded.id // Only get user's messages
        },
        order: [['createdAt', 'DESC']]
      });

      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single message by ID (only if sender)
  getMessageById: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id } = req.params;

      const message = await ChatMessage.findOne({
        // where: {
        //   id,
        //   senderId: decoded.id // Only allow sender to view
        // }
      });

      if (!message) {
        return res.status(404).json({ 
          error: 'Message not found or unauthorized' 
        });
      }

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = chatMessageController;