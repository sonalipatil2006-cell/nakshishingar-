const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');
const Feedback = require('./models/Feedback');
const User = require('./models/User');
const Product = require('./models/Product');

async function seedOrdersAndFeedback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user and some products to create realistic orders
    let user = await User.findOne();
    const products = await Product.find().limit(4);

    if (!user) {
      // Create a dummy user if none exists
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test1234', 10);
      user = await User.create({
        fullName: 'Priya Sharma',
        email: 'priya@test.com',
        password: hashedPassword,
        mobile: '9876543210'
      });
      console.log('Created dummy user: Priya Sharma');
    }

    if (products.length < 2) {
      console.log('Not enough products in DB. Run seed.js first.');
      process.exit(1);
    }

    // Create 2 dummy orders
    const order1 = await Order.create({
      customer: user._id,
      items: [
        { product: products[0]._id, name: products[0].name, price: products[0].price, quantity: 2 },
        { product: products[1]._id, name: products[1].name, price: products[1].price, quantity: 1 }
      ],
      totalAmount: products[0].price * 2 + products[1].price,
      address: {
        houseInfo: 'Flat 302, Sahyadri Apartments, MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        landmark: 'Near Shivaji Nagar Bus Stop'
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'shipped'
    });
    console.log(`Order 1 created: #NS${order1._id.toString().slice(-6).toUpperCase()} (Shipped, COD)`);

    const order2 = await Order.create({
      customer: user._id,
      items: [
        { product: products[2]._id, name: products[2].name, price: products[2].price, quantity: 1 },
        { product: products[3]._id, name: products[3].name, price: products[3].price, quantity: 3 }
      ],
      totalAmount: products[2].price + products[3].price * 3,
      address: {
        houseInfo: '12, Laxmi Narayan Colony, Station Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        landmark: 'Opposite Municipal Garden'
      },
      paymentMethod: 'online',
      paymentStatus: 'completed',
      orderStatus: 'delivered'
    });
    console.log(`Order 2 created: #NS${order2._id.toString().slice(-6).toUpperCase()} (Delivered, Online Paid)`);

    // Create 1 dummy feedback
    const feedback = await Feedback.create({
      customerName: 'Anita Kulkarni',
      email: 'anita.k@gmail.com',
      message: 'I absolutely love the nath collection! The Maharashtrian Bridal Nath I ordered was beautiful and arrived on time. The quality is amazing for the price. Will definitely order again! 🌸',
      rating: 5,
      status: 'new'
    });
    console.log(`Feedback created from: ${feedback.customerName}`);

    await mongoose.disconnect();
    console.log('\nDummy orders & feedback seeded successfully!');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
  process.exit(0);
}

seedOrdersAndFeedback();
