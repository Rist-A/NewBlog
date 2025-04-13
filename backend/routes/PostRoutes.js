//update
const express = require('express');
const router = express.Router();
const postController = require('../contoller/PostController.js');
const authMiddleware = require('../middleware/authMiddleware.js')
const multer = require('multer');


const upload = multer({
    storage: multer.memoryStorage(), // Store in memory as buffer
    limits: {
      fileSize: 100 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

// Protected routes
router.get('/posts', postController.getAllPosts);
router.get('/posts/author/:authorId', postController.getPostsByAuthorId);
router.post('/posts', upload.single('image'),postController.createPost);
// router.put('/posts/:id', postController.updatePost);

router.put('/posts/:id', upload.single('image'), postController.updatePost);
router.delete('/posts/:id', postController.deletePost);
router.get('/posts/:id', postController.getPostById);
module.exports = router;