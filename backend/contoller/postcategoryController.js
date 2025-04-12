// const  PostCategory = require('../models/PostCategory.js');
// const Post= require('../models/Post.js');

// const { Category } = require('../models/Category.js');


// // Get all posts with a certain category
// const getPostsByCategoryId = async (req, res) => {
//   try {
//     const posts = await PostCategory.findAll({
//       where: { category_id: req.params.categoryId },
//       include: [{ model: Post, include: [{ model: User, attributes: ['user_name', 'image_url'] }] }],
//     });
//     res.json(posts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Insert into PostCategory
// const addPostCategory = async (req, res) => {
//   try {
//     const postCategory = await PostCategory.create(req.body);
//     res.status(201).json(postCategory);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Delete from PostCategory
// const deletePostCategory = async (req, res) => {
//   try {
//     const deleted = await PostCategory.destroy({
//       where: { post_id: req.params.postId, category_id: req.params.categoryId },
//     });
//     if (deleted) {
//       res.status(204).json({ message: 'PostCategory deleted' });
//     } else {
//       res.status(404).json({ error: 'PostCategory not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   getPostsByCategoryId,
//   addPostCategory,
//   deletePostCategory,
// };