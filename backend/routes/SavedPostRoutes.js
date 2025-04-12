// routes/SavedPostRoutes.js
const express = require('express');
const router = express.Router();
const SavedPostController = require('../contoller/SavedPostController')
const authMiddleware = require('../middleware/authMiddleware');

// Add proper CORS headers middleware
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Your frontend URL
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Toggle save/unsave post
router.post('/posts/:postId/save', SavedPostController.toggleSavePost);

// Get all saved posts for current user
router.get('/saved-posts',  SavedPostController.getSavedPosts);

// Check if post is saved by current user
router.get('/posts/:postId/saved-status',  SavedPostController.checkSavedStatus);

module.exports = router;