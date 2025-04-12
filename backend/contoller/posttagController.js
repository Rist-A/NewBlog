// const  PostTag = require('../models/PostTag.js');
// const  Post  = require('../models/Post.js');
// const  Tag = require('../models/Tag.js');
// // Get all posts with a certain tag
// const getPostsByTagId = async (req, res) => {
//   try {
//     const posts = await PostTag.findAll({
//       where: { tag_id: req.params.tagId },
//       include: [{ model: Post, include: [{ model: User, attributes: ['user_name', 'image_url'] }] }],
//     });
//     res.json(posts);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Insert into PostTag
// const addPostTag = async (req, res) => {
//   try {
//     const postTag = await PostTag.create(req.body);
//     res.status(201).json(postTag);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Delete from PostTag
// const deletePostTag = async (req, res) => {
//   try {
//     const deleted = await PostTag.destroy({
//       where: { post_id: req.params.postId, tag_id: req.params.tagId },
//     });
//     if (deleted) {
//       res.status(204).json({ message: 'PostTag deleted' });
//     } else {
//       res.status(404).json({ error: 'PostTag not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   getPostsByTagId,
//   addPostTag,
//   deletePostTag,
// };