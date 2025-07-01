const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store'); // Import thêm để kiểm tra store của người dùng

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token received:', token);  // Log token nhận được

  if (!token) {
    return res.status(401).json({ error: 'Không có token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('Decoded token:', decoded);  // Log thông tin giải mã từ token

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }

    const store = await Store.findOne({ owner: user._id });

    req.user = {
      id: user._id,
      role: user.role,
      storeId: store ? String(store._id) : null // Thêm storeId nếu có
    };

    next();  // Chuyển sang bước tiếp theo
  } catch (err) {
    console.error('Error in verifyToken:', err);  // Log lỗi
    res.status(403).json({ error: 'Token không hợp lệ' });
  }
};

module.exports = verifyToken;
