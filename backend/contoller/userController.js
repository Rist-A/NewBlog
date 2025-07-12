const User = require('../models/User.js');
const UserRole = require('../models/UserRole.js');
const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const sequelize = require('../db.js'); 
const cloudinary = require('cloudinary').v2;
const stream = require('stream');
const jwt = require('jsonwebtoken');

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

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

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    // Verify admin role
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized',
        message: 'Admin privileges required' 
      });
    }

    const users = await User.findAll({ 
      attributes: { exclude: ['password'] },
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['role_name']
      }]
    });
    
    res.json(users.map(u => ({
      id: u.id,
      username: u.user_name,
      email: u.email,
      image: u.user_image,
      role: u.role?.role_name,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    })));
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const requestingUser = getUserFromToken(req);
    const userId = req.params.id;
    
    if (!requestingUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify permission (either admin or requesting their own data)
    if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Unauthorized',
        message: 'You can only access your own user data' 
      });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'user_name', 'email', 'user_image', 'createdAt', 'updatedAt'],
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['role_name']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.user_name,
      email: user.email,
      image: user.user_image,
      role: user.role?.role_name || 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};

// Create a new user (no auth required)
const createUser = async (req, res) => {
  try {
    const defaultImageUrl = 'https://res.cloudinary.com/docuoohjc/image/upload/v1743067077/userimage_f47hqb.webp';
    
    const { password, role = 'user', user_name, email, ...userData } = req.body;

    if (!password || !user_name || !email) {
      return res.status(400).json({ error: 'Password, user_name, and email are required' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const transaction = await sequelize.transaction();

    try {
      const userRole = await UserRole.findOne({
        where: { role_name: role.toLowerCase() },
        transaction
      });

      let role_id;
      if (!userRole) {
        const defaultRole = await UserRole.findOne({
          where: { role_name: 'user' },
          transaction
        });

        if (!defaultRole) {
          return res.status(400).json({ error: 'Default role "user" not found in the system' });
        }

        role_id = defaultRole.id;
      } else {
        role_id = userRole.id;
      }

      const user = await User.create({
        email,
        password: hashedPassword,
        user_name,
        role_id,
        user_image: req.body.user_image || defaultImageUrl,
        ...userData
      }, { transaction });

      await transaction.commit();

      // Generate JWT token for the new user
      const token = jwt.sign(
        { id: user.id, role: userRole?.role_name || 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        user_image: user.user_image,
        role: userRole ? userRole.role_name : 'user',
        token
      };

      res.status(201).json(userResponse);

    } catch (error) {
      await transaction.rollback();

      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      
      throw error;
    }

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred while creating the user',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};

// Get role by ID (admin only)
const getRoleById = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const { role_id } = req.params;

    const role = await UserRole.findByPk(role_id, {
      attributes: ['role_id', 'role_name', 'description']
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const userFromToken = getUserFromToken(req);
    if (!userFromToken) {
      await transaction.rollback();
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.params.id || userFromToken.id;
    
    // Verify permission (either admin or updating their own data)
    if (userFromToken.id !== userId && userFromToken.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    let shouldUpdate = false;

    // Handle username update
    if (req.body.user_name && req.body.user_name.trim() !== user.user_name) {
      updates.user_name = req.body.user_name.trim();
      shouldUpdate = true;
    }

    // Handle password update
    if (req.body.newPassword) {
      if (!req.body.currentPassword && userFromToken.id === userId) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Current password is required' });
      }
      
      if (userFromToken.id === userId) {
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
          await transaction.rollback();
          return res.status(400).json({ error: 'Current password is incorrect' });
        }
      }
      
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.newPassword, salt);
      shouldUpdate = true;
    }

    // Handle image upload via Cloudinary
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'user_profiles',
              width: 500,
              height: 500,
              crop: 'fill'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          const bufferStream = new stream.PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(uploadStream);
        });
        
        updates.user_image = uploadResult.secure_url;
        shouldUpdate = true;
      } catch (uploadError) {
        await transaction.rollback();
        return res.status(500).json({ 
          error: 'Failed to upload image', 
          details: uploadError.message 
        });
      }
    }

    if (!shouldUpdate) {
      await transaction.rollback();
      return res.status(200).json({ message: 'No changes needed' });
    }

    // Perform update
    await User.update(updates, { 
      where: { id: userId },
      transaction,
      validate: true 
    });

    // Fetch updated user data without password
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      transaction,
      include: [{
        model: UserRole,
        as: 'role',
        attributes: ['role_name']
      }]
    });

    await transaction.commit();

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.user_name,
        email: updatedUser.email,
        image: updatedUser.user_image,
        role: updatedUser.role?.role_name,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('UPDATE ERROR:', error);
    
    return res.status(500).json({ 
      error: 'Update failed',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  getUserById, 
  getRoleById 
};