const mongoose = require('mongoose');
require('dotenv').config();

async function checkRegDB() {
    try {
        const uri = 'mongodb://localhost:27017/registrationDB';
        await mongoose.connect(uri);
        console.log('Connected to registrationDB');
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
        const count = await User.countDocuments();
        console.log(`User count in registrationDB: ${count}`);
        if (count > 0) {
            const users = await User.find({}).limit(5);
            console.log('Users:', JSON.stringify(users));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
checkRegDB();
