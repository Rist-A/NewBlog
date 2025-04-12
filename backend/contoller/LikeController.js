// const Like = require('../models/Like.js');
// const Post = require('../models/Post.js');
// const User = require('../models/User.js');

// // Get all likes for a specific post
// const getLikesByPostId = async (req, res) => {
//   try {
//     const likes = await Like.findAll({
//       where: { post_id: req.params.postId },
//       include: [
//         { 
//           model: User, 
//           attributes: ['id', 'user_name', 'image_url'],
//           as: 'user' // Make sure this matches your association alias
//         }
//       ],
//     });
    
//     res.json({
//       success: true,
//       count: likes.length,
//       likes
//     });
    
//   } catch (error) {
//     console.error('Error fetching likes:', error);
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch likes',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Toggle like status
// const toggleLike = async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const userId = req.user.id; // Assuming you have authentication middleware
    
//     // Check if like exists
//     const existingLike = await Like.findOne({
//       where: { post_id: postId, author_id: userId }
//     });

//     if (existingLike) {
//       // Unlike the post
//       await existingLike.destroy();
//       return res.status(200).json({
//         liked: false,
//         likeCount: await Like.count({ where: { post_id: postId } })
//       });
//     } else {
//       // Like the post
//       await Like.create({
//         post_id: postId,
//         author_id: userId
//       });
//       return res.status(201).json({
//         liked: true,
//         likeCount: await Like.count({ where: { post_id: postId } })
//       });
//     }
//   } catch (error) {
//     console.error('Error toggling like:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };
// // Delete a like (alternative to toggle)
// const deleteLike = async (req, res) => {
//   try {
//     const { id: post_id } = req.params;
//     const user_id = req.user.id;

//     const deleted = await Like.destroy({
//       where: { post_id, user_id }
//     });

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         error: 'Like not found or unauthorized'
//       });
//     }

//     // Update post's like count
//     const likesCount = await Like.count({ where: { post_id } });
//     await Post.update(
//       { like_count: likesCount },
//       { where: { id: post_id } }
//     );

//     res.status(200).json({
//       success: true,
//       likesCount,
//       message: 'Like removed successfully'
//     });

//   } catch (error) {
//     console.error('Error deleting like:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to delete like',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = {
//   toggleLike,
//   getLikesByPostId,
//   deleteLike
// };

const Like = require('../models/Like.js');
const Post = require('../models/Post.js');
const User = require('../models/User.js');
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

// Get all likes for a specific post
const getLikesByPostId = async (req, res) => {
  try {
    // Validate postId format
    const { postId } = req.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid post ID format' 
      });
    }

    const likes = await Like.findAll({
      where: { post_id: postId },
      include: [
        { 
          model: User, 
          attributes: ['id', 'user_name', 'user_image'],
          as: 'author' // Changed from 'user' to match association
        }
      ],
    });
    
    res.json({
      success: true,
      count: likes.length,
      likes
    });
    
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch likes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle like status
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Get user from token
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // Validate postId format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid post ID format' 
      });
    }

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if like exists
    const existingLike = await Like.findOne({
      where: { post_id: postId, author_id: user.id }
    });

    if (existingLike) {
      // Unlike the post
      await existingLike.destroy();
      const likeCount = await Like.count({ where: { post_id: postId } });
      
      // Update post's like count
      await Post.update(
        { like_count: likeCount },
        { where: { id: postId } }
      );
      
      return res.status(200).json({
        success: true,
        liked: false,
        likeCount,
        message: 'Like removed successfully'
      });
    } else {
      // Like the post
      await Like.create({
        post_id: postId,
        author_id: user.id
      });
      
      const likeCount = await Like.count({ where: { post_id: postId } });
      
      // Update post's like count
      await Post.update(
        { like_count: likeCount },
        { where: { id: postId } }
      );
      
      return res.status(201).json({
        success: true,
        liked: true,
        likeCount,
        message: 'Like added successfully'
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a like
const deleteLike = async (req, res) => {
  try {
    const { id: postId } = req.params;
    
    // Get user from token
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // Validate postId format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(postId)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid post ID format' 
      });
    }

    const deleted = await Like.destroy({
      where: { 
        post_id: postId, 
        author_id: user.id 
      }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Like not found or unauthorized'
      });
    }

    // Update post's like count
    const likesCount = await Like.count({ where: { post_id: postId } });
    await Post.update(
      { like_count: likesCount },
      { where: { id: postId } }
    );

    res.status(200).json({
      success: true,
      likesCount,
      message: 'Like removed successfully'
    });

  } catch (error) {
    console.error('Error deleting like:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete like',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  toggleLike,
  getLikesByPostId,
  deleteLike
};