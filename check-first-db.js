const mongoose = require('mongoose');
require('dotenv').config();

async function checkFirstDB() {
    try {
        const uri = 'mongodb://localhost:27017/firstdb';
        await mongoose.connect(uri);
        console.log('Connected to firstdb');
        const users = await mongoose.connection.db.listCollections({ name: 'users' }).toArray();
        if (users.length > 0) {
            const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
            const count = await User.countDocuments();
            console.log(`User count in firstdb: ${count}`);
        } else {
            console.log('No users collection in firstdb');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
checkFirstDB();
