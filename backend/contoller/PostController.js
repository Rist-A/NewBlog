// const Post = require('../models/Post.js');
// const User = require('../models/User.js');
// const Like = require('../models/Like.js')
// const Comment = require('../models/Comment.js')
// const Category = require ('../models/Category.js')
// const { Sequelize } = require('sequelize');
// const sequelize = require('../db.js'); 
// const cloudinary = require('cloudinary').v2;
// const multer = require('multer');
// const jwt = require('jsonwebtoken');
// //Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Get all posts
// const getAllPosts = async (req, res) => {
//   try {
//     const userId = req.user?.id; // Get the logged-in user's ID (Ensure authentication middleware sets this)

//     const posts = await Post.findAll({
//       include: [
//         {
//           model: User,
//           as: 'author',
//           attributes: ['id', 'user_name', 'user_image']
//         },
//         {
//           model: Category,
//           as: 'category',
//           attributes: ['id', 'category_name']
//         },
//         {
//           model: Comment,
//           as: 'comments',
//           attributes: [],
//           required: false
//         },
//         {
//           model: Like,
//           as: 'likes',
//           attributes: ['author_id'],  // Include userId to check if the user liked the post
//           required: false
//         }
//       ],
//       attributes: {
//         include: [
//           [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('comments.id'))), 'comment_count'],
//           [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('likes.id'))), 'like_count'],
//           'id',
//           'title',
//           'content',
//           'post_image',
//           'status',
//           'createdAt',
//           'updatedAt'
//         ]
//       },
//       group: ['Post.id', 'author.id', 'category.id','likes.id'],
//       order: [['createdAt', 'DESC']]
//     });

//     // Transform the response to ensure consistent image URLs and check if the user liked the post
//     const transformedPosts = posts.map(post => {
//       const postJson = post.toJSON();
      
//       return {
//         ...postJson,
//         image_url: postJson.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
//         author: {
//           ...postJson.author,
//           user_image: postJson.author.user_image || 'default-user-image-url.jpg'
//         },
//         isLiked: postJson.likes?.some(like => like.userId === userId) || false  // Check if the logged-in user liked the post
//       };
//     });

//     res.json(transformedPosts);
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     res.status(500).json({ 
//       error: 'Failed to fetch posts',
//       ...(process.env.NODE_ENV === 'development' && { details: error.message })
//     });
//   }
// };

// // Get all posts by author ID
// const getPostsByAuthorId = async (req, res) => {
//   try {
//     const posts = await Post.findAll({
//       where: { author_id: req.params.authorId },
//       include: [{ model: User, attributes: ['user_name', 'image_url'] }],
//     });
//     res.json(posts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// // Get single post by ID
// const getPostById = async (req, res) => {
//   try {
//     const post = await Post.findByPk(req.params.id, {
//       include: [
//         {
//           model: User,
//           as: 'author',  // Must match your association alias
//           attributes: ['user_name', 'user_image']
//         },
//         {
//           model: Comment,
//           as: 'comments',  // Must match your association alias
//           include: [{
//             model: User,
//             as: 'author',  // Assuming this is the alias for Comment->User
//             attributes: ['user_name', 'user_image']
//           }]
//         },
//         {
//           model: Like,
//           as: 'likes',  // Must match your association alias
//           attributes: ['author_id']
//         }
//       ]
//     });

//     if (!post) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     // Add like count and comment count
//     const postWithCounts = {
//       ...post.toJSON(),
//       like_count: post.likes ? post.likes.length : 0,  // Note lowercase to match alias
//       comment_count: post.comments ? post.comments.length : 0  // Note lowercase
//     };

//     res.json(postWithCounts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const createPost = async (req, res) => {
//   try {
//     console.log('🟢 Request headers:', req.headers);
//     console.log('🟢 Request body:', req.body);

//     // 1. Extract token (from header or cookie)
//     let token = null;
//     const authHeader = req.headers.authorization;

//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       token = authHeader.split(' ')[1];
//     } else if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     // 2. Verify JWT
//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//       console.log('✅ Decoded token:', decoded);
//     } catch (err) {
//       console.error('❌ JWT verification failed:', err.message);
//       return res.status(401).json({ 
//         error: 'Invalid or expired token', 
//         details: err.message 
//       });
//     }

//     // 3. Validate user ID in token
//     const author_id = decoded.id;
//     if (!author_id) {
//       return res.status(401).json({ error: 'Token missing user ID' });
//     }

//     // 4. Validate required fields
//     const { title, content, category_id } = req.body;
//     if (!title || !content || !category_id) {
//       return res.status(400).json({ 
//         error: 'Title, content, and category ID are required' 
//       });
//     }

//     // 5. Validate category existence
//     const category = await Category.findByPk(category_id);
//     if (!category) {
//       return res.status(404).json({ error: 'Category not found' });
//     }

//     // 6. Handle image upload if available
//     let imageUrl = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';

//     if (req.file) {
//       try {
//         const result = await cloudinary.uploader.upload(
//           `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
//           { folder: 'blog-posts' }
//         );
//         imageUrl = result.secure_url;
//       } catch (uploadError) {
//         console.error('❌ Cloudinary upload failed:', uploadError.message);
//         return res.status(400).json({ error: 'Image upload failed' });
//       }
//     }

//     // 7. Create the post
//     const post = await Post.create({
//       title,
//       content,
//       post_image: imageUrl,
//       author_id,
//       category_id,
//       status: 'active'
//     });

//     // 8. Fetch with associations
//     const newPost = await Post.findByPk(post.id, {
//       include: [
//         { model: User, as: 'author', attributes: ['id', 'user_name', 'user_image'] },
//         { model: Category, as: 'category', attributes: ['id', 'category_name'] }
//       ]
//     });

//     return res.status(201).json(newPost);

//   } catch (error) {
//     console.error('❌ Post creation error:', error.message);
//     return res.status(500).json({
//       error: 'Internal server error',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


// // const createPost = async (req, res) => {
// //   try {
// //     console.log('Received file:', req.file);
// //     // Validate request body
// //     const { title, content, category_id } = req.body;
    
// //     if (!title || !content || !category_id) {
// //       return res.status(400).json({ 
// //         error: 'Title, content, and category ID are required' 
// //       });
// //     }

// //     // Get author_id from the authenticated user (from JWT)
// //     if (!req.user || !req.user.id) {
// //       return res.status(401).json({ error: 'User not authenticated' });
// //     }
// //     const author_id = req.user.id;

// //     // Validate category_id format (UUID)
// //     if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(category_id)) {
// //       return res.status(400).json({ error: 'Invalid category ID format' });
// //     }

// //     // Verify category exists
// //     const category = await Category.findByPk(category_id);
// //     if (!category) {
// //       return res.status(404).json({ error: 'Category not found' });
// //     }

// //     let imageUrl = null;

// //     if (req.file) {  
// //     // Log file to see if it's properly received
// // // Now properly handling the uploaded file
// //       try {
// //         const result = await cloudinary.uploader.upload(
// //           `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
// //           { folder: 'blog-posts' }
// //         );
// //         console.log("Cloudinary upload result:", result); 
// //         imageUrl = result.secure_url;
// //       } catch (uploadError) {
// //     console.error('Image upload failed:', uploadError);
// //     return res.status(400).json({ error: 'Image upload failed' });
// //   }
// // }

// // // Only set default image if no image was uploaded
// // if (!imageUrl) {
// //   imageUrl = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';
// // }

// //     // Create post with author_id from JWT
// //     const post = await Post.create({
// //       title,
// //       content,
// //       post_image: imageUrl,
// //       author_id, // Now coming from the authenticated user
// //       category_id,
// //       status: 'active'
// //     });

// //     // Fetch complete post with associations
// //     const newPost = await Post.findByPk(post.id, {
// //       include: [
// //         {
// //           model: User,
// //           as: 'author',
// //           attributes: ['id', 'user_name', 'user_image']
// //         },
// //         {
// //           model: Category,
// //           as: 'category',
// //           attributes: ['id', 'category_name']
// //         }
// //       ]
// //     });

// //     res.status(201).json(newPost);

// //   } catch (error) {
// //     console.error('Post creation error:', error);
// //     res.status(500).json({ 
// //       error: error.message || 'Failed to create post',
// //       details: process.env.NODE_ENV === 'development' ? error.stack : undefined
// //     });
// //   }
// // };


// // Update a post
// const updatePost = async (req, res) => {
//   try {
//     const [updated] = await Post.update(req.body, {
//       where: { id: req.params.id, author_id: req.user.id }, // Only the author can update
//     });
//     if (updated) {
//       const updatedPost = await Post.findByPk(req.params.id);
//       res.json(updatedPost);
//     } else {
//       res.status(404).json({ error: 'Post not found or unauthorized' });
//     }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Delete a post
// const deletePost = async (req, res) => {
//   try {
//     const deleted = await Post.destroy({
//       where: { id: req.params.id, author_id: req.user.id }, // Only the author can delete
//     });
//     if (deleted) {
//       res.status(204).json({ message: 'Post deleted' });
//     } else {
//       res.status(404).json({ error: 'Post not found or unauthorized' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // // Add to module.exports
// module.exports = {
//   getAllPosts,
//   getPostsByAuthorId,
//   createPost,
//   updatePost,
//   deletePost,
//   getPostById 
// };

const Post = require('../models/Post.js');
const User = require('../models/User.js');
const Like = require('../models/Like.js');
const Comment = require('../models/Comment.js');
const Category = require('../models/Category.js');
const { Sequelize } = require('sequelize');
const sequelize = require('../db.js'); 
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract user from token
const getUserFromToken = (req) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const userId = user?.id;

    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'user_name', 'user_image']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: [],
          required: false
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['author_id'],
          required: false
        }
      ],
      attributes: {
        include: [
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('comments.id'))), 'comment_count'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('likes.id'))), 'like_count'],
          'id',
          'title',
          'content',
          'post_image',
          'status',
          'createdAt',
          'updatedAt'
        ]
      },
      group: ['Post.id', 'author.id', 'category.id', 'likes.id'],
      order: [['createdAt', 'DESC']]
    });

    const transformedPosts = posts.map(post => {
      const postJson = post.toJSON();
      
      return {
        ...postJson,
        image_url: postJson.post_image || 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg',
        author: {
          ...postJson.author,
          user_image: postJson.author.user_image || 'default-user-image-url.jpg'
        },
        isLiked: postJson.likes?.some(like => like.author_id === userId) || false
      };
    });

    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Get all posts by author ID
const getPostsByAuthorId = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { author_id: req.params.authorId },
      include: [
        { 
          model: User, 
          as: 'author',
          attributes: ['id', 'user_name', 'user_image'] 
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const userId = user?.id;

    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'user_name', 'user_image']
        },
        {
          model: Comment,
          as: 'comments',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'user_name', 'user_image']
          }],
          order: [['createdAt', 'DESC']]
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['author_id']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'category_name']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postWithCounts = {
      ...post.toJSON(),
      like_count: post.likes ? post.likes.length : 0,
      comment_count: post.comments ? post.comments.length : 0,
      isLiked: post.likes?.some(like => like.author_id === userId) || false
    };

    res.json(postWithCounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a post
const createPost = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, content, category_id } = req.body;
    if (!title || !content || !category_id) {
      return res.status(400).json({ 
        error: 'Title, content, and category ID are required' 
      });
    }

    // Validate category existence
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let imageUrl = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743161246/noimage_uhgqfc.jpg';

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'blog-posts' }
        );
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        return res.status(400).json({ error: 'Image upload failed' });
      }
    }

    const post = await Post.create({
      title,
      content,
      post_image: imageUrl,
      author_id: user.id,
      category_id,
      status: 'active'
    });

    const newPost = await Post.findByPk(post.id, {
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'user_name', 'user_image'] 
        },
        { 
          model: Category, 
          as: 'category', 
          attributes: ['id', 'category_name'] 
        }
      ]
    });

    return res.status(201).json(newPost);

  } catch (error) {
    console.error('Post creation error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [updated] = await Post.update(req.body, {
      where: { 
        id: req.params.id, 
        author_id: user.id // Only the author can update
      },
    });

    if (updated) {
      const updatedPost = await Post.findByPk(req.params.id, {
        include: [
          { 
            model: User, 
            as: 'author', 
            attributes: ['id', 'user_name', 'user_image'] 
          },
          { 
            model: Category, 
            as: 'category', 
            attributes: ['id', 'category_name'] 
          }
        ]
      });
      res.json(updatedPost);
    } else {
      res.status(404).json({ error: 'Post not found or unauthorized' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deleted = await Post.destroy({
      where: { 
        id: req.params.id, 
        author_id: user.id // Only the author can delete
      },
    });

    if (deleted) {
      res.status(204).json({ message: 'Post deleted' });
    } else {
      res.status(404).json({ error: 'Post not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostsByAuthorId,
  createPost,
  updatePost,
  deletePost,
  getPostById
};