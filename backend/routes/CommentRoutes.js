const express = require('express');
const router = express.Router();
const commentController = require('../contoller/Commentcontroller');
const authMiddleware = require('../middleware/authMiddleware.js')
const { body } = require('express-validator');
// Protected routes
// router.get('/posts/:postId/comments', commentController.getCommentsByPostId);
// router.get('/comments/:id', commentController.getCommentById);
router.post('/posts/:postId/comments', commentController.createComment);
router.put('/comments/:id', commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);
const commentValidationRules = [
    body('content').trim().notEmpty().withMessage('Comment content is required')
  ];
  
  // Get comments for a post (no auth required)
  router.get('/posts/:postId/comments', commentController.getCommentsForPost);
  
  // Create comment (requires auth)
  router.post(
    '/posts/:postId/comments',
    
    commentValidationRules,
    commentController.createComment
  );
  
  // Update comment (requires auth)
  router.put(
    '/comments/:commentId',
    
    commentValidationRules,
    commentController.updateComment
  );
  
  // Delete comment (requires auth)
  router.delete(
    '/comments/:commentId',
    
    commentController.deleteComment
  );
  
module.exports = router;
