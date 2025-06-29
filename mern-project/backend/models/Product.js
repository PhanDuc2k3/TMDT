const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  description: String,
  category: String,
  quantity: Number,
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
