const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Single hardcoded admin credentials
const ADMIN_EMAIL = 'admin@nakhsishurngar.com';
const ADMIN_PASSWORD = 'Nakhsi@admin2024';

const Order = require('../models/Order');

// Admin Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt - Email: "${email}", Password: "${password}"`);
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ isAdmin: true, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token, message: 'Admin login successful' });
  } else {
    console.log('Login failed: Credentials mismatch');
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: 'Not an admin' });
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin stats for reports
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const { range } = req.query; // weekly, monthly, yearly, all
    let startDate = new Date();
    
    if (range === 'weekly') startDate.setDate(startDate.getDate() - 7);
    else if (range === 'monthly') startDate.setMonth(startDate.getMonth() - 1);
    else if (range === 'yearly') startDate.setFullYear(startDate.getFullYear() - 1);
    else startDate = new Date(0); // All time

    const allOrders = await Order.find({
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    const completedOrders = allOrders.filter(o => o.paymentStatus === 'completed');
    const refundedOrders = allOrders.filter(o => o.paymentStatus === 'refunded');
    const cancelledOrders = allOrders.filter(o => o.orderStatus === 'cancelled');
    const pendingOrders = allOrders.filter(o => o.orderStatus !== 'cancelled' && o.orderStatus !== 'delivered' && o.orderStatus !== 'returned' && o.paymentStatus !== 'completed');

    // Aggregate data for graphs
    const salesData = {};
    const productPerformance = {};
    let totalRevenue = 0;
    let totalLoss = 0; // Refunds + Cancelled value

    completedOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesData[date] = (salesData[date] || 0) + order.totalAmount;
      totalRevenue += order.totalAmount;

      order.items.forEach(item => {
        productPerformance[item.name] = (productPerformance[item.name] || 0) + item.quantity;
      });
    });

    refundedOrders.forEach(order => {
      totalLoss += order.totalAmount;
    });

    const formattedSales = Object.entries(salesData).map(([date, amount]) => ({ date, amount }));
    const formattedProductPerf = Object.entries(productPerformance)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    res.json({
      totalRevenue,
      totalLoss,
      netProfit: totalRevenue - totalLoss,
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      refundedOrders: refundedOrders.length,
      cancelledOrders: cancelledOrders.length,
      pendingOrders: pendingOrders.length,
      salesData: formattedSales,
      productPerformance: formattedProductPerf,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/verify', verifyAdmin, (req, res) => {
  res.json({ isAdmin: true, message: 'Token valid' });
});

module.exports = { router, verifyAdmin };
