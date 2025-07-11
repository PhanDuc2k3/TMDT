const Store = require('../models/Store');
const User = require('../models/User');

// Tạo gian hàng mới
const registerStore = async (req, res) => {
  try {
    const { name, description, logoUrl, category, rating, location } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Tên gian hàng và mô tả là bắt buộc' });
    }

    // Kiểm tra xem seller đã có gian hàng chưa
    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return res.status(409).json({ error: 'Bạn đã có một gian hàng' });
    }

    const newStore = new Store({
      name,
      description,
      logoUrl: logoUrl || 'https://via.placeholder.com/150', // Nếu không có logo, sử dụng ảnh mặc định
      category: category || 'Khác', // Default là 'Khác' nếu không chọn
      rating: rating || 0, // Default là 0 nếu không có rating
      location: location || 'Chưa cập nhật', // Default là 'Chưa cập nhật'
      owner: req.user.id  // Liên kết với user đã đăng nhập
    });

    await newStore.save();

    // Cập nhật trường 'store' trong bảng User để liên kết gian hàng với user
    const user = await User.findById(req.user.id);
    user.store = newStore._id;  // Lưu ObjectId của store vào bảng users
    await user.save();

    res.status(201).json({
      message: 'Gian hàng đã được đăng ký thành công',
      store: newStore
    });
  } catch (err) {
    console.error('Lỗi khi đăng ký gian hàng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách tất cả gian hàng
const getStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('owner', 'fullName email');
    res.json(stores);
  } catch (err) {
    console.error('Lỗi khi lấy gian hàng:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerStore,
  getStores,
  getStoreById,
};
