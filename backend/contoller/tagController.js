const Tag  = require('../models/Tag.js');

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tag by ID
const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (tag) {
      res.json(tag);
    } else {
      res.status(404).json({ error: 'Tag not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new tag
const createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a tag
const updateTag = async (req, res) => {
  try {
    const [updated] = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedTag = await Tag.findByPk(req.params.id);
      res.json(updatedTag);
    } else {
      res.status(404).json({ error: 'Tag not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a tag
const deleteTag = async (req, res) => {
  try {
    const deleted = await Tag.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).json({ message: 'Tag deleted' });
    } else {
      res.status(404).json({ error: 'Tag not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};