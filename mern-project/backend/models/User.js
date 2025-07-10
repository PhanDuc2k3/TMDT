const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  avatarUrl: {
    type: String,
    default: 'https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg', // ✅ Đặt avatar mặc định
  },
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
    },
    requestedAt: Date,
    store: {
      name: { type: String },
      description: { type: String },
      logoUrl: { type: String },
      category: { type: String },
      rating: { type: Number },
      location: { type: String },
      isActive: { type: Boolean }
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
