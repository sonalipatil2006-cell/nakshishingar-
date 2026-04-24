const mongoose = require('mongoose');
require('dotenv').config();

const users = ["69de8dceb58a4076873f59cb","69de91633d19d2aab1be63e2","69df05393241ed4a82b7344d","69e9be28999ed6d6d0f392c6"];
const products = [
    {id:"69df17c16264654aed46ec30",name:"ear rings",price:150},
    {id:"69df4fdf4d6a4f35e74322f4",name:"Parnika Nath",price:350},
    {id:"69df50284d6a4f35e74322f9",name:"Kamalini Nath",price:300},
    {id:"69df505e4d6a4f35e74322fc",name:"Phulvanti Nath",price:380},
    {id:"69df50a74d6a4f35e74322ff",name:"Tarini Nath",price:270},
    {id:"69df50dc4d6a4f35e7432302",name:" Kanaka Nath",price:300},
    {id:"69df529f4d6a4f35e7432379",name:"Emerald Peacock Chandbali Mangalsutra",price:400},
    {id:"69df52d94d6a4f35e743237c",name:"Royal Lotus Pearl Drop Mangalsutra",price:500},
    {id:"69df52fe4d6a4f35e743237f",name:"Dual Chandbali Green Bead Mangalsutra",price:380},
    {id:"69df53b74d6a4f35e74323eb",name:"Meenakari Lotus Bead Mangalsutra",price:550}
];

const cities = ["Mumbai", "Pune", "Nashik", "Nagpur", "Kolhapur", "Aurangabad"];
const addresses = [
    { houseInfo: "101, Shanti Niwas", pincode: "400001", state: "Maharashtra" },
    { houseInfo: "Flat 202, Royal Residency", pincode: "411007", state: "Maharashtra" },
    { houseInfo: "Plot No 45, Vidya Nagar", pincode: "422003", state: "Maharashtra" },
    { houseInfo: "55, Gandhi Road", pincode: "440010", state: "Maharashtra" }
];

async function seedOrders() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Order = mongoose.connection.db.collection('orders');

    const orders = [];
    const now = new Date();

    for (let i = 0; i < 25; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const numItems = Math.floor(Math.random() * 2) + 1;
        const items = [];
        let total = 0;

        for (let j = 0; j < numItems; j++) {
            const prod = products[Math.floor(Math.random() * products.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            items.push({
                product: new mongoose.Types.ObjectId(prod.id),
                name: prod.name,
                price: prod.price,
                quantity: qty
            });
            total += prod.price * qty;
        }

        const method = i < 5 ? 'online' : 'cod';
        const pStatus = method === 'online' ? 'completed' : (Math.random() > 0.5 ? 'completed' : 'pending');
        const oStatusChoices = ['delivered', 'shipped', 'processing', 'placed'];
        const oStatus = i < 15 ? 'delivered' : oStatusChoices[Math.floor(Math.random() * oStatusChoices.length)];

        // Random date in last 3 weeks
        const orderDate = new Date(now.getTime() - Math.floor(Math.random() * 21 * 24 * 60 * 60 * 1000));
        
        const addr = addresses[Math.floor(Math.random() * addresses.length)];

        orders.push({
            customer: new mongoose.Types.ObjectId(user),
            items: items,
            totalAmount: total,
            address: {
                ...addr,
                city: cities[Math.floor(Math.random() * cities.length)],
                landmark: "Near Main Gate"
            },
            paymentStatus: pStatus,
            orderStatus: oStatus,
            paymentMethod: method,
            createdAt: orderDate,
            updatedAt: orderDate
        });
    }

    await Order.insertMany(orders);
    console.log('✅ 25 Dummy Orders added successfully!');
    process.exit(0);
}

seedOrders();
