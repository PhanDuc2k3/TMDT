const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },  // Đảm bảo lưu số điện thoại
  address: { type: String }, // Đảm bảo lưu địa chỉ

  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },

  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },

  sellerRequest: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: null
    },
    requestedAt: Date
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
