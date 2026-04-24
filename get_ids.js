const mongoose = require('mongoose');
require('dotenv').config();

async function getData() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
    const products = await mongoose.connection.db.collection('products').find({}).limit(10).toArray();
    console.log(JSON.stringify({ users: users.map(u => u._id), products: products.map(p => ({id: p._id, name: p.name, price: p.price})) }));
    process.exit(0);
}
getData();
