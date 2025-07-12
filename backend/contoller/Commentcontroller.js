const { validationResult } = require('express-validator');
const Post = require("../models/Post.js");
const Comment = require("../models/Comment.js");
const User = require("../models/User.js");
const jwt = require('jsonwebtoken');

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

module.exports = {
  getCommentsForPost: async (req, res) => {
    try {
      const { postId } = req.params;

      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
        return res.status(400).json({ error: 'Invalid post ID format' });
      }

      const comments = await Comment.findAll({
        where: { post_id: postId },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            attributes: ['id', 'user_name', 'user_image'],
            as: 'author'
          }
        ]
      });

      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

   createComment : async (req, res) => {
    console.log('Create comment request received'); // Debug log
    
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array()); // Debug log
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { postId } = req.params;
      const { content } = req.body;
      
      // Get user from token
      const user = getUserFromToken(req);
      if (!user) {
        console.log('No user found in token'); // Debug log
        return res.status(401).json({ error: 'Authentication required' });
      }
  
      console.log(`Creating comment for post ${postId} by user ${user.id}`); // Debug log
  
      // Validate postId format (UUID)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
        console.log('Invalid post ID format:', postId); // Debug log
        return res.status(400).json({ error: 'Invalid post ID format' });
      }
  
      // Verify post exists
      const post = await Post.findByPk(postId);
      if (!post) {
        console.log('Post not found:', postId); // Debug log
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Create comment
      console.log('Creating comment with content:', content); // Debug log
      const comment = await Comment.create({
        content,
        post_id: postId,
        author_id: user.id
      });
  
      // Fetch the newly created comment with user details
      const newComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            attributes: ['id', 'user_name', 'user_image'],
            as: 'author'
          }
        ]
      });
  
      console.log('Comment created successfully:', newComment.id); // Debug log
      return res.status(201).json(newComment);
      
    } catch (error) {
      console.error('Error creating comment:', error); // Detailed error log
      return res.status(500).json({ 
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
          message: error.message,
          stack: error.stack 
        })
      });
    }
  },

  updateComment: async (req, res) => {
    // Validate request body first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id: commentId } = req.params;
      const { content } = req.body;
      
      // Get user from token instead of auth middleware
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // More comprehensive parameter validation
      if (!commentId || typeof commentId !== 'string') {
        return res.status(400).json({ 
          error: 'Valid comment ID is required',
          received: commentId
        });
      }

      if (!content || typeof content !== 'string') {
        return res.status(400).json({ 
          error: 'Valid content is required',
          received: content
        });
      }

      // Find and update the comment
      const [updateCount, updatedComments] = await Comment.update(
        { content },
        {
          where: { 
            id: commentId,
            author_id: user.id
          },
          returning: true,
          individualHooks: true
        }
      );

      if (updateCount === 0) {
        return res.status(404).json({ 
          error: 'Comment not found or you are not authorized to edit this comment',
          commentId,
          author_id: user.id
        });
      }

      // Return the updated comment
      res.json({
        success: true,
        message: 'Comment updated successfully',
        comment: updatedComments[0]
      });

    } catch (error) {
      console.error('Error updating comment:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => e.message) 
        });
      }

      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const commentId = req.params.id;
      
      // Get user from token instead of auth middleware
      const user = getUserFromToken(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Validate parameters
      if (!commentId) {
        return res.status(400).json({ error: 'Comment ID is required' });
      }

      // Perform deletion and check affected rows
      const deletedCount = await Comment.destroy({
        where: { 
          id: commentId,
          author_id: user.id 
        }
      });

      if (deletedCount === 0) {
        return res.status(404).json({ 
          error: 'Comment not found or unauthorized',
          details: `User ${user.id} cannot delete comment ${commentId}`
        });
      }

      return res.status(204).end();

    } catch (error) {
      console.error('Error deleting comment:', error);
      
      if (error.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ 
          error: 'Invalid comment ID format',
          details: 'The provided ID format is incorrect'
        });
      }

      return res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  getCommentsByPostId: async (req, res) => {
    try {
      const comments = await Comment.findAll({
        where: { post_id: req.params.postId },
        include: [{ 
          model: User, 
          attributes: ['id', 'user_name', 'user_image'],
          as: 'author'
        }],
      });
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCommentById: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id, {
        include: [{ 
          model: User, 
          attributes: ['id', 'user_name', 'user_image'],
          as: 'author'
        }],
      });
      if (comment) {
        res.json(comment);
      } else {
        res.status(404).json({ error: 'Comment not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};