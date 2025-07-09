const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 1000,
    trim: true,
  }
}, {
  timestamps: true
});

// (Tuỳ chọn) Chặn mỗi user chỉ review 1 lần cho 1 sản phẩm trong 1 đơn
reviewSchema.index({ product: 1, user: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
