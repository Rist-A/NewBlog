const express = require('express');
const router = express.Router();
const tagController = require('../contoller/tagController.js');
const authMiddleware = require('../middleware/authMiddleware.js')

// Protected routes
router.get('/tags', tagController.getAllTags);
router.get('/tags/:id', tagController.getTagById);
router.post('/tags', authMiddleware(['admin', 'subadmin']), tagController.createTag);
router.put('/tags/:id', authMiddleware(['admin', 'subadmin']), tagController.updateTag);
router.delete('/tags/:id', authMiddleware(['admin', 'subadmin']), tagController.deleteTag);

module.exports = router;
