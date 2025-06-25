const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/role');
const { getBuyers } = require('../controllers/userController');

// Lấy thông tin profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Buyer gửi yêu cầu trở thành seller
router.post('/request-seller', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User không tồn tại' });

    if (user.role !== 'buyer') {
      return res.status(400).json({ error: 'Chỉ người dùng buyer mới được yêu cầu' });
    }

    if (user.sellerRequest?.status === 'pending') {
      return res.status(400).json({ error: 'Yêu cầu của bạn đang chờ duyệt' });
    }

    user.sellerRequest = {
      status: 'pending',
      requestedAt: new Date()
    };

    await user.save();
    res.json({ message: '✅ Yêu cầu làm seller đã được gửi. Vui lòng chờ admin duyệt.' });

  } catch (err) {
    res.status(500).json({ error: 'Lỗi server khi gửi yêu cầu seller' });
  }
});

// Lấy danh sách buyer – dành riêng cho admin
router.get('/buyers', verifyToken, isAdmin, getBuyers);

module.exports = router;
