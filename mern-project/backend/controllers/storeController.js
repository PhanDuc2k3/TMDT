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

module.exports = {
  registerStore,
  getStores
};
