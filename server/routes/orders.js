const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyAdmin } = require('./admin');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../utils/sendEmail');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// @route   POST api/orders
// @desc    Place a new order
// @access  Private
router.post('/', verifyUser, async (req, res) => {
  try {
    const { items, totalAmount, address, paymentMethod, paymentStatus, transactionId } = req.body;
    const order = new Order({
      customer: req.userId,
      items,
      totalAmount,
      address,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      transactionId
    });
    await order.save();

    // Send order confirmation email to customer
    try {
      const user = await User.findById(req.userId);
      if (user && user.email) {
        await sendOrderConfirmationEmail(user.email, user.fullName, order);
      }
    } catch (emailErr) {
      console.error('Order email error:', emailErr.message);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/orders/my-orders
// @desc    Get current user's orders
// @access  Private
router.get('/my-orders', verifyUser, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET api/orders
// @desc    Get all orders (Admin only)
// @access  Admin
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().populate('customer', 'fullName email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Admin
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'fullName email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await order.save();

    // Send status update email to customer
    try {
      if (order.customer && order.customer.email) {
        await sendOrderStatusEmail(order.customer.email, order.customer.fullName, order, order.orderStatus);
      }
    } catch (emailErr) {
      console.error('Status update email error:', emailErr.message);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH api/orders/:id/cancel
// @desc    Cancel an order (Customer only, only if placed)
// @access  Private
router.patch('/:id/cancel', verifyUser, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'placed') return res.status(400).json({ message: 'Only orders with status "placed" can be cancelled' });
    
    order.orderStatus = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH api/orders/:id/return
// @desc    Request a return (Customer only, only if delivered)
// @access  Private
router.patch('/:id/return', verifyUser, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customer: req.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.orderStatus !== 'delivered') return res.status(400).json({ message: 'Only delivered orders can be returned' });
    
    order.orderStatus = 'return-requested';
    order.returnReason = reason;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST api/orders/create-payment-order
// @desc    Create a Razorpay order
// @access  Private
router.post('/create-payment-order', verifyUser, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    console.log('[Razorpay Debug] Using Key ID:', process.env.RAZORPAY_KEY_ID);
    
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    
    console.log('[Razorpay Debug] Creating order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('[Razorpay Debug] Order created successfully:', order.id);
    res.json(order);
  } catch (err) {
    console.error('[Razorpay Debug] Full Error:', err);
    const errorMsg = (err.error && err.error.description) ? err.error.description : (err.message || "Failed to create payment order");
    res.status(500).json({ message: errorMsg });
  }
});

// @route   POST api/orders/verify-payment
// @desc    Verify Razorpay payment signature
// @access  Private
router.post('/verify-payment', verifyUser, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
    
    // Create signature hash
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment verified, save the order
      const order = new Order({
        ...orderData,
        customer: req.userId,
        paymentStatus: 'completed',
        transactionId: razorpay_payment_id
      });
      await order.save();

      // Send email
      try {
        const user = await User.findById(req.userId);
        if (user && user.email) {
          await sendOrderConfirmationEmail(user.email, user.fullName, order);
        }
      } catch (emailErr) {
        console.error('Order email error:', emailErr.message);
      }

      return res.status(200).json({ message: "Payment verified successfully", order });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
