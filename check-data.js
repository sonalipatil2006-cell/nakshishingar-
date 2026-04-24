const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const productCount = await Product.countDocuments();
        console.log(`Product count in nakshi: ${productCount}`);

        if (productCount === 0) {
            console.log('Database is empty! Run "node seed.js" to populate it.');
        } else {
            const sample = await Product.findOne();
            console.log('Sample Product:', sample.name);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
checkData();
