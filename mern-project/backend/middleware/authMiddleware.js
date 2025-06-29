const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store'); // ✅ import thêm

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Không có token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Token không hợp lệ' });

    // ✅ Tìm store của user
    const store = await Store.findOne({ owner: user._id });

    req.user = {
      id: user._id,
      role: user.role,
      storeId: store ? String(store._id) : null // Thêm storeId nếu có
    };

    next();
  } catch (err) {
    res.status(403).json({ error: 'Token không hợp lệ' });
  }
};

module.exports = verifyToken;
