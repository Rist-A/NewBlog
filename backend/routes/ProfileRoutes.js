// routes/ProfileRoutes.js
const express = require('express');
const router = express.Router();
const ProfileController = require('../contoller/ProfileController')
const authMiddleware = require('../middleware/authMiddleware');

// Get complete user profile
router.get('/profile', ProfileController.getUserProfile);

module.exports = router;