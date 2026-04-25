const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  imagePath: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
