const Product = require('../models/Product');
const Store = require('../models/Store');

// Lấy sản phẩm của seller hiện tại
exports.getMyProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json('Không tìm thấy cửa hàng của bạn');

    const products = await Product.find({ store: store._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json('Không tìm thấy cửa hàng của bạn');

    const {
      name, description, price, salePrice, images,
      brand, subCategory, quantity, variations, isActive
    } = req.body;

    if (!name || price == null || quantity == null) {
      return res.status(400).json('Vui lòng nhập đầy đủ tên, giá và số lượng');
    }

    if (price < 0 || quantity < 0) {
      return res.status(400).json('Giá và số lượng phải là số không âm');
    }

    const newProduct = new Product({
      name, description, price, salePrice, images,
      brand, subCategory, quantity, variations,
      isActive: isActive ?? true,
      store: store._id
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json('Không tìm thấy cửa hàng của bạn');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json('Không tìm thấy sản phẩm');

    if (String(product.store) !== String(store._id)) {
      return res.status(403).json('Bạn không có quyền chỉnh sửa sản phẩm này');
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Xoá sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json('Không tìm thấy cửa hàng của bạn');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json('Không tìm thấy sản phẩm');

    if (String(product.store) !== String(store._id)) {
      return res.status(403).json('Bạn không có quyền xoá sản phẩm này');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json('Đã xoá sản phẩm');
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Lấy sản phẩm theo storeId (trang ShopDetail)
exports.getProductsByStore = async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeId, isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy chi tiết sản phẩm theo id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json('Không tìm thấy sản phẩm');

    res.json(product);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
