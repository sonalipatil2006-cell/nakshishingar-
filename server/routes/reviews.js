const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const jwt = require('jsonwebtoken');

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userName = decoded.fullName || 'Anonymous';
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// @route   POST api/reviews
// @desc    Submit a product review
// @access  Private
router.post('/', verifyUser, async (req, res) => {
  try {
    const { productId, rating, comment, userName } = req.body;
    const review = new Review({
      product: productId,
      user: req.userId,
      userName: userName || req.userName,
      rating,
      comment
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/reviews/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
