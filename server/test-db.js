const mongoose = require('mongoose');
require('dotenv').config();

async function testConn() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');
        const dbs = await mongoose.connection.db.admin().listDatabases();
        console.log('Databases:', JSON.stringify(dbs.databases.map(d => d.name)));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
}
testConn();
