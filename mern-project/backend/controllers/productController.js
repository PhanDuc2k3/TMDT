const Product = require('../models/Product');
const Store = require('../models/Store');

// Lấy sản phẩm của seller hiện tại
exports.getMyProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json('Store not found');

    const products = await Product.find({ store: store._id });
    res.json(products);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json('Store not found');

    const newProduct = new Product({ ...req.body, store: store._id });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json('Product not found');

    if (String(product.store) !== req.user.storeId)
      return res.status(403).json('You do not own this product');

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// Xoá sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json('Product not found');

    if (String(product.store) !== req.user.storeId)
      return res.status(403).json('You do not own this product');

    await Product.findByIdAndDelete(req.params.id);
    res.json('Deleted');
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ Thêm: Lấy sản phẩm theo storeId (dùng cho trang ShopDetail)
exports.getProductsByStore = async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.storeId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
