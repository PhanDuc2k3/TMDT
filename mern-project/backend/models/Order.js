const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: Number,
  status: { type: String, default: 'Chờ xử lý' }, // Có thể là: Chờ xử lý, Đã xác nhận, Đang giao, Hoàn thành, Hủy
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
