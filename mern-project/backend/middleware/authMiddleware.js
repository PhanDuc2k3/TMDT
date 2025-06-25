const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Không có token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user trong DB để lấy role
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'Token không hợp lệ' });

    // ✅ Gán đầy đủ thông tin vào req.user
    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (err) {
    res.status(403).json({ error: 'Token không hợp lệ' });
  }
};

module.exports = verifyToken;
