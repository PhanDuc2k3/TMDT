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
  const { storeName, description } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    if (user.role !== 'buyer' || user.sellerRequest?.status !== 'pending') {
      return res.status(400).json({ error: 'Không hợp lệ hoặc không có yêu cầu cần duyệt' });
    }

    // Tạo store mới
    const store = new Store({
      name: storeName || user.fullName + "'s Store",
      description: description || '',
      owner: user._id
    });
    await store.save();

    // Cập nhật user
    user.role = 'seller';
    user.store = store._id;
    user.sellerRequest.status = 'approved';
    await user.save();

    res.json({ message: '✅ Seller đã được duyệt', store });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi duyệt seller' });
  }
});

module.exports = router;
