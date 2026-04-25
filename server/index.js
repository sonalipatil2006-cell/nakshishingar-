const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Serve uploaded product images statically
app.use('/products', express.static(path.join(__dirname, '../client/public/products')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => {
    console.error('❌ Could not connect to MongoDB Atlas.');
    console.error('Error Details:', err.message);
  });

// Basic Route
app.get('/', (req, res) => {
  res.send('Nakshishrungar API is running');
});

// Import and use routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin').router);
app.use('/api/products', require('./routes/products'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/custom-orders', require('./routes/customOrders'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/categories', require('./routes/categories'));

// --- DEPLOYMENT CONFIGURATION ---
// Serve frontend static files from the client's dist directory
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API Route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});
// --------------------------------

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
