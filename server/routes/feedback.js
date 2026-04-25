const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyAdmin } = require('./admin');

// POST — Customer submits feedback (public)
router.post('/', async (req, res) => {
  try {
    const { customerName, email, message, rating } = req.body;
    const feedback = new Feedback({ customerName, email, message, rating });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Admin gets all feedback
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH — Admin marks feedback status
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE — Admin deletes feedback
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
