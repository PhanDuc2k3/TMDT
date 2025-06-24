const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateTokens } = require('../utils/token');

// Đăng ký
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // dùng false nếu phát triển local không dùng HTTPS
      path: '/api/auth/refresh-token',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
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
      secure: true, // dùng false nếu phát triển local không dùng HTTPS
      path: '/api/auth/refresh-token',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login thành công',
        accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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
      expiresIn: '15m',
    });

    res.json({ accessToken });
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
};
