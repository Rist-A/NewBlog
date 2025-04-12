const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../contoller/userController.js')// Fix typo: 'contoller' → 'controllers'
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.post('/users', userController.createUser);

// Protected routes
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/update', 
   
  upload.single('image'),
  userController.updateUser
);

// Role-specific route
router.get('/roles/:role_id',  userController.getRoleById);

module.exports = router;