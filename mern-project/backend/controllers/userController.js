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
      avatarUrl: user.avatarUrl ,
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
