const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const user_roles = require('../models/UserRole.js');

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user with their role information
    const user = await User.findOne({
      where: { email },
      include: [{
        model: user_roles,
        as: 'role',
        attributes: ['id', 'role_name'] // Include role id for reference
      }],
      attributes: ['id', 'email', 'user_name', 'password', 'user_image', 'role_id']
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'No user found with this email'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: 'Incorrect password'
      });
    }

    // Prepare user data for token
    const userData = {
      id: user.id,
      email: user.email,
      user_name: user.user_name,
      user_image: user.user_image || null,
      role: user.role ? user.role.role_name : 'user',
      role_id: user.role_id // Include role_id for reference
    };

    // Generate token
    const token = jwt.sign(
      userData,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Increased expiration time
    );

    res.json({ 
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        user_image: user.user_image || null,
        role: user.role ? user.role.role_name : 'user',
        role_id: user.role_id
      },
      expiresIn: 24 * 60 * 60
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};

// Logout controller
const logout = (req, res) => {
  res.json({ 
    success: true,
    message: 'Logout successful. Please remove the token client-side.' 
  });
};

module.exports = { login, logout };