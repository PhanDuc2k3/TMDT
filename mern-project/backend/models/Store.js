const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,  // Mô tả gian hàng
  logoUrl: {            // URL ảnh logo gian hàng
    type: String,
    default: 'https://via.placeholder.com/150'  // URL mặc định nếu chưa có logo
  },
  category: {           // Danh mục gian hàng (Điện tử, Thời trang, ...)
    type: String,
    enum: ['Điện tử', 'Thời trang', 'Mỹ phẩm', 'Gia dụng', 'Thực phẩm', 'Khác'],
    default: 'Khác'
  },
  rating: {             // Đánh giá gian hàng (số điểm trung bình)
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  location: {           // Địa chỉ hoặc tọa độ của gian hàng
    type: String,
    default: 'Chưa cập nhật'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {           // Trạng thái gian hàng (hoạt động hay không)
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Store', storeSchema);
