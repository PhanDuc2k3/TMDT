const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/role');

// Approve seller
router.post('/approve-seller/:userId', verifyToken, isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { storeName, description } = req.body;

  try {
    // Tạo store mới
    const store = new Store({
      name: storeName,
      description,
      owner: userId
    });

    await store.save();

    // Cập nhật user role & gán store
    await User.findByIdAndUpdate(userId, {
      role: 'seller',
      store: store._id
    });

    res.json({ message: 'Seller approved successfully', store });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
