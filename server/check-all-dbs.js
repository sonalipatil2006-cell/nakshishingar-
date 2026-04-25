const mongoose = require('mongoose');

async function checkAll() {
    try {
        const dbs = ['nakshi', 'registrationDB', 'firstdb', 'local'];
        for (const dbName of dbs) {
            const uri = `mongodb://localhost:27017/${dbName}`;
            await mongoose.connect(uri);
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`\n--- DB: ${dbName} ---`);
            for (const col of collections) {
                const count = await mongoose.connection.db.collection(col.name).countDocuments();
                console.log(`Collection: ${col.name}, Count: ${count}`);
            }
            await mongoose.disconnect();
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}
checkAll();
