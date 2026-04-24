const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const CustomOrder = require('./models/CustomOrder');
const Review = require('./models/Review');
const User = require('./models/User');

const products = [
  // ===== NATH (4 products) =====
  { name: 'Bridal Maharashtrian Nath', description: 'Traditional Peshwai style bridal nath with high-quality pearls and ruby stones. Perfectly handcrafted for your special day.', price: 450, category: 'nath', imagePath: '/products/nath1.png', inStock: true },
  { name: 'Crystal Pearl Nath', description: 'Elegant pearl nath with crystal accents. Lightweight and comfortable for long wearing during festivals.', price: 350, category: 'nath', imagePath: '/products/nath1.png', inStock: true },
  { name: 'Classic Banu Nath', description: 'The famous Banu style nath as seen in traditional Maharashtrian culture. Simple yet powerful statement piece.', price: 299, category: 'nath', imagePath: '/products/nath1.png', inStock: true },
  { name: 'Antique Gold Nath', description: 'Antique finish gold nath with intricate carvings. Gives a vintage royal look to your ethnic attire.', price: 550, category: 'nath', imagePath: '/products/nath1.png', inStock: true },

  // ===== MANGALSUTRA (4 products) =====
  { name: 'Traditional Long Mangalsutra', description: '30-inch long traditional black bead mangalsutra with a grand Vati pendant. Authentically designed for daily elegance.', price: 599, category: 'mangalsutra', imagePath: '/products/mangalsutra1.png', inStock: true },
  { name: 'Modern Diamond Mangalsutra', description: 'Square American Diamond pendant on a delicate black bead chain. Perfect for office and western wear.', price: 499, category: 'mangalsutra', imagePath: '/products/mangalsutra1.png', inStock: true },
  { name: 'Short Daily Wear Mangalsutra', description: 'Minimalist single bead mangalsutra for the modern woman. Lightweight and stylish.', price: 299, category: 'mangalsutra', imagePath: '/products/mangalsutra1.png', inStock: true },
  { name: 'Royal Maharashtrian Mangalsutra', description: 'Double stranded black bead chain with a gold-plated meenakari pendant set. Includes matching earrings.', price: 899, category: 'mangalsutra', imagePath: '/products/mangalsutra1.png', inStock: true },

  // ===== CHOKER (4 products) =====
  { name: 'Temple Gold Choker', description: 'Exquisite temple jewellery choker with Lakshmi motifs. Antique finish for a traditional festive look.', price: 550, category: 'choker', imagePath: '/products/choker1.png', inStock: true },
  { name: 'Pearl Layered Choker', description: '5-layered shell pearl choker with a central ruby-colored stone. Defines luxury and grace.', price: 450, category: 'choker', imagePath: '/products/choker1.png', inStock: true },
  { name: 'Kundan Bridal Choker', description: 'Heavy kundan work choker set with green bead drops. A must-have for wedding guests.', price: 699, category: 'choker', imagePath: '/products/choker1.png', inStock: true },
  { name: 'Traditional Thushi Choker', description: 'Authentic Maharashtrian Thushi necklace. Small gold-plated beads tightly woven for a unique texture.', price: 399, category: 'choker', imagePath: '/products/choker1.png', inStock: true },

  // ===== JHUMKA (4 products) =====
  { name: 'Gold-Plated Temple Jhumka', description: 'Bell-shaped temple jhumkas with small pearl hangings. Perfect for silk sarees.', price: 399, category: 'jhumka', imagePath: '/products/jhumka1.png', inStock: true },
  { name: 'Oxidized Silver Jhumka', description: 'Trendy oversized oxidized jhumkas with peacock motifs. Great for casual and boho looks.', price: 199, category: 'jhumka', imagePath: '/products/jhumka1.png', inStock: true },
  { name: 'Ruby Stone Jhumka', description: 'Elegant gold-toned jhumkas with a large central ruby stone. Classic and timeless.', price: 450, category: 'jhumka', imagePath: '/products/jhumka1.png', inStock: true },
  { name: 'Mini Daily Wear Jhumka', description: 'Small and cute jhumkas for daily use. Lightweight alloy with long-lasting gold polish.', price: 150, category: 'jhumka', imagePath: '/products/jhumka1.png', inStock: true },

  // ===== EAR CUFF (4 products) =====
  { name: 'Kundan Ear Cuff', description: 'Wrap-around ear cuffs with kundan stones. Covers the entire ear edge for a grand look.', price: 350, category: 'earcuff', imagePath: '/products/earcuff1.png', inStock: true },
  { name: 'Pearl Chain Ear Cuff', description: 'Single stud connected to a cuff with a delicate pearl chain drape.', price: 250, category: 'earcuff', imagePath: '/products/earcuff1.png', inStock: true },
  { name: 'Gold Filigree Ear Cuff', description: 'Intricate gold wire work ear cuffs. Modern yet traditional.', price: 299, category: 'earcuff', imagePath: '/products/earcuff1.png', inStock: true },
  { name: 'Diamond Drop Ear Cuff', description: 'Floating diamond effect ear cuffs. Sparkles beautifully under lights.', price: 399, category: 'earcuff', imagePath: '/products/earcuff1.png', inStock: true },

  // ===== INVISIBLE NECKLACE (4 products) =====
  { name: 'Solitaire Floating Necklace', description: 'A single brilliant-cut CZ stone on a transparent nylon thread. Appears to float on your skin.', price: 350, category: 'invisible', imagePath: '/products/invisible1.png', inStock: true },
  { name: 'Heart Shape Invisible Chain', description: 'Cute heart pendant on an invisible thread. Perfect gift for loved ones.', price: 299, category: 'invisible', imagePath: '/products/invisible1.png', inStock: true },
  { name: 'Pearl Drop Invisible Necklace', description: 'A single high-lustre shell pearl floating on your neckline.', price: 250, category: 'invisible', imagePath: '/products/invisible1.png', inStock: true },
  { name: 'Star Sparkle Invisible Chain', description: 'Tiny gold-plated star with a center stone on a clear thread.', price: 199, category: 'invisible', imagePath: '/products/invisible1.png', inStock: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear data
    await Product.deleteMany({});
    await Review.deleteMany({});
    await CustomOrder.deleteMany({});

    // Create/Find a dummy user for reviews
    const bcrypt = require('bcryptjs');
    let user = await User.findOne({ email: 'customer@test.com' });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = await User.create({
        fullName: 'Anita Kulkarni',
        email: 'customer@test.com',
        mobile: '9876543210',
        password: hashedPassword
      });
    }

    const reviewMessages = [
      "Absolutely beautiful! Quality is much better than expected.",
      "Beautiful design, looks exactly like real gold.",
      "Very comfortable to wear. Got many compliments.",
      "Perfect for the wedding I attended. Highly recommend!",
      "Simple and elegant. Great for daily use.",
      "The pearl quality is excellent. Shines beautifully."
    ];

    // Insert Products one by one to ensure we have IDs for reviews
    for (const pData of products) {
      const rating1 = 4 + Math.floor(Math.random() * 2);
      const rating2 = 4 + Math.floor(Math.random() * 2);

      const prod = await Product.create({
        ...pData,
        avgRating: (rating1 + rating2) / 2,
        numReviews: 2
      });

      await Review.create([
        { product: prod._id, user: user._id, userName: user.fullName, rating: rating1, comment: reviewMessages[Math.floor(Math.random() * reviewMessages.length)] },
        { product: prod._id, user: user._id, userName: user.fullName, rating: rating2, comment: reviewMessages[Math.floor(Math.random() * reviewMessages.length)] }
      ]);
    }

    console.log(`Inserted ${products.length} products with 2 reviews each.`);

    // Insert some Custom Orders
    await CustomOrder.create([
      { customerName: 'Snehal Patil', email: 'snehal@test.com', phone: '9123456789', category: 'nath', description: 'Need a custom nath with green beads for my engagement.', status: 'pending' },
      { customerName: 'Pooja Deshmukh', email: 'pooja@test.com', phone: '9988776655', category: 'mangalsutra', description: 'Want a 24-inch mangalsutra with a specific pendant design (image shared on WhatsApp).', status: 'confirmed' }
    ]);

    await mongoose.disconnect();
    console.log('\nDatabase Seeded Successfully! 🌸');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
  process.exit(0);
}

seed();
