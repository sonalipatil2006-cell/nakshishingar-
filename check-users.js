const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        console.log(`User count in nakshi: ${count}`);
        if (count > 0) {
            const users = await User.find({}, 'email fullName').limit(5);
            console.log('Sample users:', JSON.stringify(users));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
checkUsers();
