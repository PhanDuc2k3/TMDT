const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateTokens } = require('../utils/token');

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, address, avatarUrl } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
      avatarUrl: avatarUrl || '',
      role: 'buyer'
    });

    await newUser.save();

    const { accessToken, refreshToken } = generateTokens(newUser._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      accessToken,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone || null,
        address: newUser.address || null,
        avatarUrl: newUser.avatarUrl || '',
        role: newUser.role,
        sellerRequest: newUser.sellerRequest || null
      }
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
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
      secure: true,
      sameSite: 'Strict',
      path: '/api/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Đăng nhập thành công',
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        avatarUrl: user.avatarUrl || '',
        role: user.role,
        sellerRequest: user.sellerRequest || null
      }
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Làm mới token
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

// Gửi yêu cầu làm seller
const requestSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    if (user.role !== 'buyer') {
      return res.status(400).json({ error: 'Chỉ người mua mới có thể gửi yêu cầu' });
    }

    if (user.sellerRequest?.status === 'pending') {
      return res.status(400).json({ error: 'Yêu cầu của bạn đang chờ xét duyệt' });
    }

    const {
      name,
      description,
      logoUrl,
      category,
      rating,
      location,
      isActive
    } = req.body;

    if (!name || !description || !category || typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'Vui lòng cung cấp đủ thông tin cửa hàng' });
    }

    user.sellerRequest = {
      status: 'pending',
      requestedAt: new Date(),
      store: {
        name,
        description,
        logoUrl: logoUrl || '',
        category,
        rating: rating || 0,
        location: location || '',
        isActive
      }
    };

    await user.save();

    res.json({ message: '✅ Đã gửi yêu cầu làm seller. Vui lòng chờ admin duyệt.' });
  } catch (err) {
    console.error('Lỗi gửi yêu cầu seller:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách người mua (admin dùng)
const getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' }).select('-password');
    res.json(buyers);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách buyer:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Lấy thông tin profile của người dùng
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('store');

    if (!user) return res.status(404).json({ error: 'Người dùng không tồn tại' });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      avatarUrl: user.avatarUrl || 'data:image/png;base64,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',
      role: user.role,
      store: user.store || null,
      sellerRequest: user.sellerRequest || null
    });
  } catch (err) {
    console.error('Lỗi khi lấy profile:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};
// Cập nhật thông tin cá nhân
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, avatarUrl } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, address, avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({ message: 'Cập nhật thông tin thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật thông tin:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  requestSeller,
  getBuyers,
  getProfile,
  updateProfile
};
