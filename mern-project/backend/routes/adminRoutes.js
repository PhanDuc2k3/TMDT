const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/role');

// Admin lấy danh sách yêu cầu seller
router.get('/seller-requests', verifyToken, isAdmin, async (req, res) => {
  try {
    const requests = await User.find({ 'sellerRequest.status': 'pending' }).select('-password');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu seller' });
  }
});

// Admin duyệt seller
router.patch('/approve-seller/:userId', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { storeName, storeDescription, logoUrl, category, rating, location, isActive } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    if (user.role !== 'buyer' || user.sellerRequest?.status !== 'pending') {
      return res.status(400).json({ error: 'Không hợp lệ hoặc không có yêu cầu cần duyệt' });
    }

    // Tạo store mới với dữ liệu từ Seller
    const store = new Store({
      name: storeName || user.fullName + "'s Store", // Nếu không có tên gian hàng, dùng tên người dùng
      description: storeDescription || '',  // Mô tả gian hàng
      logoUrl: logoUrl || 'https://via.placeholder.com/150', // Nếu không có logo, sử dụng ảnh mặc định
      category: category || 'Khác', // Nếu không có danh mục, mặc định là 'Khác'
      rating: rating || 0, // Nếu không có đánh giá, mặc định là 0
      location: location || 'Chưa cập nhật', // Nếu không có địa chỉ, mặc định là 'Chưa cập nhật'
      owner: user._id, // Liên kết owner với user
      isActive: isActive || true, // Trạng thái hoạt động của gian hàng
    });

    await store.save();

    // Cập nhật thông tin User
    user.role = 'seller';
    user.store = store._id; // Liên kết store với user
    user.sellerRequest.status = 'approved';
    await user.save();

    // Trả về thông tin User và Store sau khi duyệt
    const updatedUser = await User.findById(userId).populate('store');
    res.json({ message: '✅ Seller đã được duyệt', user: updatedUser, store });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi duyệt seller' });
  }
});

// Admin từ chối seller
router.patch('/reject-seller/:userId', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    if (user.role !== 'buyer' || user.sellerRequest?.status !== 'pending') {
      return res.status(400).json({ error: 'Không hợp lệ hoặc không có yêu cầu cần từ chối' });
    }

    // Cập nhật trạng thái yêu cầu là "rejected"
    user.sellerRequest.status = 'rejected';
    await user.save();

    res.json({ message: '❌ Từ chối yêu cầu thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi từ chối seller' });
  }
});

module.exports = router;
