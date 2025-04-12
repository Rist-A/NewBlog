// // controllers/ProfileController.js
// const User = require('../models/User.js');
// const Post = require('../models/Post.js');
// const SavedPost = require('../models/SavedPost.js');
// const { Sequelize } = require('sequelize');

// // Get complete user profile with posts and saved posts
// const getUserProfile = async (req, res) => {
//   try {
//     console.log("Authenticated user:", req.user); // Debug logging
    
//     if (!req.user?.id) {
//       return res.status(401).json({ error: 'User ID missing from request' });
//     }

//     const userId = req.user.id;
    
//     // Debug: Verify user exists
//     const userExists = await User.findByPk(userId, { attributes: ['id'] });
//     if (!userExists) {
//       return res.status(404).json({ error: 'User not found in database' });
//     }

//     // Transform the data for better frontend consumption
//     const profileData = {
//       user: {
//         id: user.id,
//         user_name: user.user_name,
//         email: user.email,
//         user_image: user.user_image,
//         role: user.role_id // Or join with UserRole if needed
//       },
//       posts: user.posts.map(post => ({
//         ...post.get({ plain: true }),
//         image_url: post.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
//         author: {
//           ...post.author.get({ plain: true }),
//           user_image: post.author.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'
//         }
//       })),
//       savedPosts: user.savedPosts.map(saved => ({
//         ...saved.get({ plain: true }),
//         post: {
//           ...saved.post.get({ plain: true }),
//           image_url: saved.post.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
//           author: {
//             ...saved.post.author.get({ plain: true }),
//             user_image: saved.post.author.user_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp'
//           }
//         }
//       }))
//     };

//     res.json(profileData);
//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch profile',
//       ...(process.env.NODE_ENV === 'development' && { details: error.message })
//     });
//   }
// };

// module.exports = {
//   getUserProfile
// };
const User = require('../models/User');
const Post = require('../models/Post');
const SavedPost = require('../models/SavedPost');
const Category = require('../models/Category');
const jwt = require('jsonwebtoken');

const getUserProfile = async (req, res) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify and decode the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID missing from token' });
    }

    // Get user with associated posts and saved posts
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Post,
          as: 'posts',
          include: [
            { 
              model: User, 
              as: 'author',
              attributes: ['id', 'user_name', 'user_image', 'role_id']
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'category_name'] // Changed from 'name' to 'category_name'
            }
          ]
        },
        {
          model: SavedPost,
          as: 'savedPosts',
          include: [
            {
              model: Post,
              as: 'post',
              include: [
                {
                  model: User,
                  as: 'author',
                  attributes: ['id', 'user_name', 'user_image', 'role_id']
                },
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'category_name'] // Changed from 'name' to 'category_name'
                }
              ]
            }
          ]
        }
      ],
      attributes: ['id', 'user_name', 'email', 'user_image', 'role_id']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Default image URLs
    const DEFAULT_USER_IMAGE = 'https://res-console.cloudinary.com/docuoohjc/thumbnails/v1/image/upload/v1743067077/dXNlcmltYWdlX2Y0N2hxYg==/drilldown';
    const DEFAULT_POST_IMAGE = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';

    // Transform the data with proper null checks
    const profileData = {
      user: {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_image: user.user_image || DEFAULT_USER_IMAGE,
        role: user.role_id
      },
      posts: (user.posts || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        status: post.status,
        post_image: post.post_image || DEFAULT_POST_IMAGE,
        created_at: post.createdAt,
        updated_at: post.updatedAt,
        author: post.author ? {
          id: post.author.id,
          user_name: post.author.user_name,
          user_image: post.author.user_image || DEFAULT_USER_IMAGE,
          role: post.author.role_id
        } : null,
        category: post.category ? {
          id: post.category.id,
          name: post.category.category_name // Changed from 'name' to 'category_name'
        } : null
      })),
      savedPosts: (user.savedPosts || []).map(saved => ({
        id: saved.id,
        created_at: saved.createdAt,
        post: saved.post ? {
          id: saved.post.id,
          title: saved.post.title,
          content: saved.post.content,
          status: saved.post.status,
          post_image: saved.post.post_image || DEFAULT_POST_IMAGE,
          created_at: saved.post.createdAt,
          updated_at: saved.post.updatedAt,
          author: saved.post.author ? {
            id: saved.post.author.id,
            user_name: saved.post.author.user_name,
            user_image: saved.post.author.user_image || DEFAULT_USER_IMAGE,
            role: saved.post.author.role_id
          } : null,
          category: saved.post.category ? {
            id: saved.post.category.id,
            name: saved.post.category.category_name // Changed from 'name' to 'category_name'
          } : null
        } : null
      })).filter(saved => saved.post !== null) // Remove entries with null posts
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    let errorMessage = 'Failed to fetch profile';
    if (error.name === 'SequelizeDatabaseError') {
      errorMessage = 'Database error occurred';
      console.error('Database error details:', error.parent);
    }

    res.status(500).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        ...(error.parent && { sqlError: error.parent.detail }),
        stack: error.stack 
      })
    });
  }
};

module.exports = {
  getUserProfile
};