const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateTokens } = require('../utils/token');

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;

    // Kiểm tra thông tin đăng ký
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mới tài khoản user mà không tạo sellerRequest ngay lập tức
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,     // Lưu phone
      address,   // Lưu address
      role: 'buyer' // Role mặc định là 'buyer'
    });

    // Lưu người dùng vào cơ sở dữ liệu
    await newUser.save();

    // Tạo access token và refresh token
    const { accessToken, refreshToken } = generateTokens(newUser._id);

    // Lưu refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      path: '/api/auth/refresh-token',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Trả về phản hồi đăng ký thành công
    res.status(201).json({
      message: 'Đăng ký thành công',
      accessToken,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,  // Trả về phone
        address: newUser.address,  // Trả về address
        role: newUser.role,
        sellerRequest: newUser.sellerRequest  // Trả về sellerRequest mặc định là null
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Đăng nhập
const loginUser = async (req, res) => {
  try {
    console.log('>> loginUser được gọi');

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      path: '/api/auth/refresh-token',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // ✅ Ghi log kiểm tra dữ liệu phản hồi
    console.log('>> user trả về:', {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      message: 'Login thành công',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,  // Trả về phone
        address: user.address,  // Trả về address
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Làm mới access token
const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: 'Không có refresh token' });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Refresh token không hợp lệ' });
    }

    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    res.json({ accessToken });
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken
};
