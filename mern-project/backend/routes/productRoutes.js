const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByStore,
  getProductById
} = require('../controllers/productController');

// Seller thao tác sản phẩm
router.get('/my-products', verifyToken, getMyProducts);
router.post('/create', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

// Public: xem sản phẩm theo cửa hàng
router.get('/by-store/:storeId', getProductsByStore);

// Public: xem chi tiết sản phẩm
router.get('/:id', getProductById);

module.exports = router;
