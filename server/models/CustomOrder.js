const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest or legacy, but we'll try to set it
  },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  description: { type: String, required: true },
  category: { type: String, required: true },
  budget: { type: String },
  price: { type: Number, default: 0 }, // Set by Admin
  referenceImage: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'quoted', 'confirmed', 'in-progress', 'completed', 'shipped', 'cancelled'], 
    default: 'pending' 
  },
  trackingInfo: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('CustomOrder', customOrderSchema);
