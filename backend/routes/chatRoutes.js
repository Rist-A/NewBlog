const express = require('express');
const router = express.Router();
const chatMessageController = require("../contoller/ChatMessageController.js");


// Apply auth middleware to all routes


router.post('/chat', chatMessageController.createMessage);
router.get('/chats', chatMessageController.getAllMessages);
router.get('/chat/:id', chatMessageController.getMessageById);
router.put('/chat/:id/reply', chatMessageController.updateReply);
router.delete('/:id', chatMessageController.deleteMessage);

module.exports = router;