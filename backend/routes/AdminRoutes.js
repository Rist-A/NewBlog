// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../contoller/AdminController');


// Admin stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

module.exports = router;