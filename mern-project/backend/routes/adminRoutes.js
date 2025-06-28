const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/role');

// Admin lấy danh sách yêu cầu seller
router.get('/seller-requests', verifyToken, isAdmin, async (req, res) => {
  try {
    // Lấy danh sách người dùng có yêu cầu seller đang chờ duyệt
    const requests = await User.find({ 'sellerRequest.status': 'pending' }).select('-password');
    if (!requests) {
      return res.status(404).json({ error: 'Không có yêu cầu seller nào' });
    }
    res.json({ requests });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách yêu cầu seller:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách yêu cầu seller' });
  }
});

// Admin duyệt seller
// adminRoutes.js
router.patch('/approve-seller/:userId', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Kiểm tra trạng thái yêu cầu seller
    if (user.sellerRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Yêu cầu không hợp lệ hoặc đã được duyệt' });
    }

    // Tạo gian hàng từ thông tin trong sellerRequest
    const storeData = user.sellerRequest.store;
    const store = new Store({
      name: storeData.name,
      description: storeData.description,
      logoUrl: storeData.logoUrl,
      category: storeData.category,
      rating: storeData.rating,
      location: storeData.location,
      isActive: storeData.isActive,
      owner: user._id  // Liên kết gian hàng với user
    });

    await store.save();  // Lưu gian hàng vào cơ sở dữ liệu

    // Cập nhật user với gian hàng vừa tạo
    user.role = 'seller';
    user.store = store._id;  // Liên kết gian hàng với user
    user.sellerRequest.status = 'approved';  // Cập nhật trạng thái yêu cầu thành 'approved'
    await user.save();  // Lưu lại user với các thay đổi

    res.json({
      message: '✅ Yêu cầu đã được duyệt, gian hàng đã được tạo.',
      user,
      store
    });
  } catch (err) {
    console.error('Lỗi khi duyệt seller:', err);
    res.status(500).json({ error: 'Lỗi server khi duyệt seller' });
  }
});

// Admin từ chối seller
router.patch('/reject-seller/:userId', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User không tồn tại' });
    }

    // Kiểm tra vai trò và trạng thái yêu cầu seller
    if (user.role !== 'buyer' || user.sellerRequest?.status !== 'pending') {
      return res.status(400).json({ error: 'Không hợp lệ hoặc không có yêu cầu cần từ chối' });
    }

    // Cập nhật trạng thái yêu cầu là "rejected"
    user.sellerRequest.status = 'rejected';
    await user.save();

    res.json({ message: '❌ Từ chối yêu cầu thành công' });
  } catch (err) {
    console.error('Lỗi khi từ chối seller:', err);
    res.status(500).json({ error: 'Lỗi server khi từ chối seller' });
  }
});

module.exports = router;
