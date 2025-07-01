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
  momoTransactionId: { type: String },  // ID giao dịch của Momo
  momoPayType: { type: String },        // Phương thức thanh toán
  momoResultCode: { type: String },     // Mã kết quả từ Momo (0 là thành công)
  momoMessage: { type: String },        // Thông điệp kết quả thanh toán
  momoAmount: { type: Number },         // Số tiền thanh toán
  momoCreatedAt: { type: Date },        // Thời gian tạo giao dịch
});

module.exports = mongoose.model('Order', OrderSchema);
