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

    const { title, content, category_id } = req.body;
    const updateData = { title, content, category_id };

    // Handle image upload if file exists
    let imageUrl;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          { folder: 'blog-posts' }
        );
        imageUrl = result.secure_url;
        updateData.post_image = imageUrl;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        return res.status(400).json({ error: 'Image upload failed' });
      }
    }

    const [updated] = await Post.update(updateData, {
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
    console.error('Post update error:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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