const Post = require('../models/Post.js');
const SavedPost = require('../models/SavedPost.js');
const User = require("../models/User.js");
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Toggle save/unsave post
const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Validate postId format (UUID)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already saved
    const [existingSave, created] = await SavedPost.findOrCreate({
      where: {
        post_id: postId,
        user_id: user.id
      },
      defaults: {
        post_id: postId,
        user_id: user.id
      }
    });

    if (!created) {
      // Unsave the post if it already existed
      await existingSave.destroy();
      return res.json({ 
        success: true,
        action: 'unsaved',
        message: 'Post unsaved successfully'
      });
    }

    return res.status(201).json({
      success: true,
      action: 'saved',
      message: 'Post saved successfully',
      data: existingSave
    });
  } catch (error) {
    console.error('Error toggling saved post:', error);
    res.status(500).json({
      error: 'Failed to toggle saved post',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Get all saved posts for current user
const getSavedPosts = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const savedPosts = await SavedPost.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Post,
          as: 'post',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'user_name', 'user_image']
            }
          ],
          where: { status: 'active' } // Only include active posts
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: savedPosts.length,
      savedPosts: savedPosts.map(sp => ({
        id: sp.id,
        createdAt: sp.createdAt,
        post: {
          ...sp.post.get({ plain: true }),
          isSaved: true // Since we're fetching saved posts
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({
      error: 'Failed to fetch saved posts',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Check if post is saved by current user
const checkSavedStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    // Validate postId format (UUID)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    const savedPost = await SavedPost.findOne({
      where: {
        post_id: postId,
        user_id: user.id
      }
    });

    res.json({
      success: true,
      isSaved: !!savedPost
    });
  } catch (error) {
    console.error('Error checking saved status:', error);
    res.status(500).json({
      error: 'Failed to check saved status',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

module.exports = {
  toggleSavePost,
  getSavedPosts,
  checkSavedStatus
};