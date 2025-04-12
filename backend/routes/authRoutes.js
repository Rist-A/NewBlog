const express = require('express');
const router = express.Router();
const authController = require('../contoller/authController.js');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;