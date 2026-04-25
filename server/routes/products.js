const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const { verifyAdmin } = require('./admin');

// Multer storage config — saves to client/public/products/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/public/products'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add new product (admin only)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const imagePath = `/products/${req.file.filename}`;
    const product = new Product({ name, description, price, category, imagePath });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE product (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH toggle stock status (admin only)
router.patch('/:id/stock', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.inStock = !product.inStock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update product (admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const updateData = { name, description, price: Number(price), category };
    if (inStock !== undefined) updateData.inStock = inStock === 'true' || inStock === true;
    if (req.file) {
      updateData.imagePath = `/products/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
