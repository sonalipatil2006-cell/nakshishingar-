const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { verifyAdmin } = require('./admin');
const multer = require('multer');
const path = require('path');

// Multer storage config — saves to client/public/categories/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/public/products')); // Using same folder for now or I can create categories folder
  },
  filename: (req, file, cb) => {
    cb(null, 'cat-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a category
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, label } = req.body;
    const categoryData = { name, label };
    if (req.file) {
      categoryData.imagePath = `/products/${req.file.filename}`;
    }
    const category = new Category(categoryData);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a category
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, label } = req.body;
    const updateData = { name, label };
    if (req.file) {
      updateData.imagePath = `/products/${req.file.filename}`;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a category
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
