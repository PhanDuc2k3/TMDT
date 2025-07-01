const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true }, // ⭐ Thêm store
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: Number,
status: {
  type: String,
  default: 'Chờ xử lý',
  enum: ['Chờ xử lý', 'Đã xác nhận', 'Đã thanh toán', 'Đang giao', 'Hoàn thành', 'Hủy']
}
,
  createdAt: { type: Date, default: Date.now },

  // Momo Payment Fields
  momoTransactionId: { type: String },
  momoPayType: { type: String },
  momoResultCode: { type: String },
  momoMessage: { type: String },
  momoAmount: { type: Number },
  momoCreatedAt: { type: Date },
});

module.exports = mongoose.model('Order', OrderSchema);
