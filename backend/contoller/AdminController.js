// controllers/adminController.js
const User = require("../models/User.js");
const Post = require("../models/Post.js");
const Category = require("../models/Category.js");
const Tag = require("../models/Tag.js");

const UserRole = require ("../models/UserRole.js")
const { validationResult } = require('express-validator');
const sequelize = require("../db");



module.exports = {
  // Get admin statistics
  getStats: async (req, res) => {
    try {
      // Count all users
      const userCount = await User.count();
      
      // Count all posts
      const postCount = await Post.count();
      
      // Count all categories
      const categoryCount = await Category.count();
      
      // Count all tags
      const tagCount = await Tag.count();
      
      // Count users by role (using your UserRole model)
      const roles = await UserRole.findAll({
        include: [{
          model: User,
          attributes: [],
          as: 'users'
        }],
        group: ['UserRole.id'],
        attributes: [
          'role_name',
          [sequelize.fn('COUNT', sequelize.col('users.id')), 'count']
        ],
        raw: true
      });

      // Format role counts
      const roleCounts = roles.reduce((acc, role) => {
        acc[role.role_name] = role.count;
        return acc;
      }, { admin: 0, subadmin: 0, user: 0 });

      // Get recent activity
      const recentActivity = await Activity.findAll({
        order: [['created_at', 'DESC']],
        limit: 5,
        include: [{
          model: User,
          attributes: ['user_name'],
          as: 'user'
        }],
        raw: true
      });

      res.json({
        userCount,
        postCount,
        categoryCount,
        tagCount,
        userRoles: roleCounts,
        recentActivity: recentActivity.map(activity => ({
          icon: activity.icon,
          title: activity.title,
          description: activity.description,
          time: activity.created_at
        }))
      });
      
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get all users
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'user_name', 'email'],
        include: [{
          model: UserRole,
          attributes: ['role_name'],
          as: 'role'
        }],
        order: [['created_at', 'DESC']]
      });
      
      res.json(users.map(user => ({
        id: user.id,
        username: user.user_name,
        email: user.email,
        role: user.role.role_name
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { user_id } = req.params;
      const { role } = req.body;
      
      // Validate role
      if (!['admin', 'subadmin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      // Find the role first
      const roleRecord = await UserRole.findOne({
        where: { role_name: role }
      });
      
      if (!roleRecord) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      
      // Update user's role
      const [updated] = await User.update(
        { role_id: roleRecord.id },
        { where: { id: user_id } }
      );
      
      if (!updated) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get updated user
      const user = await User.findByPk(user_id, {
        attributes: ['id', 'user_name', 'email'],
        include: [{
          model: UserRole,
          attributes: ['role_name'],
          as: 'role'
        }]
      });
      
      // Log activity
      await Activity.create({
        icon: '👤',
        title: 'User Role Changed',
        description: `${user.user_name}'s role changed to ${role}`,
        user_id: req.user.id
      });
      
      res.json({
        id: user.id,
        username: user.user_name,
        email: user.email,
        role: user.role.role_name
      });
      
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};