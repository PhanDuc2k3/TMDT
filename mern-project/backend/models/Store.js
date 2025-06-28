const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Điện tử', 'Thời trang', 'Mỹ phẩm', 'Gia dụng', 'Thực phẩm', 'Khác'],
    default: 'Khác',
  },
  rating: {
    type: Number,
    default: 0,
  },
  location: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Liên kết với bảng User
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
