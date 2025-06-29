const express = require('express');
const router = express.Router();

const { registerStore, getStores, getStoreById } = require('../controllers/storeController');
const verifyToken = require('../middleware/authMiddleware');

// Lấy danh sách các gian hàng
router.get('/stores', getStores);

// Lấy chi tiết một gian hàng theo ID
router.get('/stores/:id', getStoreById);

// Seller đăng ký gian hàng mới (có xác thực)
router.post('/stores', verifyToken, registerStore);

module.exports = router;
