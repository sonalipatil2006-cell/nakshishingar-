const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const CustomOrder = require('../models/CustomOrder');
const { verifyAdmin } = require('./admin');

// Multer for reference images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/public/products'));
  },
  filename: (req, file, cb) => {
    cb(null, 'custom-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST — Customer submits custom order request
router.post('/', upload.single('referenceImage'), async (req, res) => {
  try {
    const { customer, customerName, phone, email, description, category, budget } = req.body;
    const referenceImage = req.file ? `/products/${req.file.filename}` : '';
    const order = new CustomOrder({ 
      customer: customer || null, 
      customerName, phone, email, description, category, budget, referenceImage 
    });
    await order.save();
    res.status(201).json({ message: 'Custom order request submitted!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Customer fetches their own custom orders
router.get('/my-orders', async (req, res) => {
  try {
    const { email, phone } = req.query; // Use email or phone to find orders
    if (!email && !phone) return res.status(400).json({ message: 'Email or phone required' });
    
    const orders = await CustomOrder.find({
      $or: [{ email }, { phone }]
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH — Customer confirms the quote
router.patch('/:id/confirm', async (req, res) => {
  try {
    const order = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );
    res.json({ message: 'Order confirmed!', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET — Admin gets all custom orders
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await CustomOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH — Admin updates order status, price, or tracking
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status, adminNotes, price, trackingInfo } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (price !== undefined) updateData.price = price;
    if (trackingInfo !== undefined) updateData.trackingInfo = trackingInfo;

    const order = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE — Admin deletes custom order
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await CustomOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Custom order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
