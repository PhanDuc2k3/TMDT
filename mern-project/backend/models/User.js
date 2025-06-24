// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },           // 👈 tên người dùng
  phone: { type: String },                               // 👈 số điện thoại
  address: { type: String },                             // 👈 địa chỉ
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
