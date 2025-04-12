const express = require('express');
const router = express.Router();
const likeController = require('../contoller/LikeController');
const authMiddleware = require('../middleware/authMiddleware.js')

// Protected routes
router.get('/posts/:postId/likes',  likeController.getLikesByPostId);
//router.post('/posts/:postId/likes', likeController.createLike);
router.delete('/posts/:postId/likes', likeController.deleteLike);
router.post('/posts/:postId/likes', likeController.toggleLike);

// Check if user has liked a post
//router.get('/posts/:postId/likes/check', authMiddleware, likeController.checkLikeStatus);

module.exports = router;