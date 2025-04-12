const express = require('express');
const router = express.Router();
const CategoryController = require('../contoller/CategoryController');
const authMiddleware = require('../middleware/authMiddleware.js')
// Protected routes (require authentication)
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id',  CategoryController.getCategoryById);
router.post('/categories', authMiddleware(['admin']), CategoryController.createCategory);
router.put('/categories/:id', authMiddleware(['admin']), CategoryController.updateCategory);
router.delete('/categories/:id', authMiddleware(['admin']), CategoryController.deleteCategory);

module.exports = router;