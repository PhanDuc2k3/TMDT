const express = require('express');
const router = express.Router();

const { registerStore, getStores } = require('../controllers/storeController');
const verifyToken = require('../middleware/authMiddleware');

// Lấy danh sách các gian hàng
router.get('/stores', getStores);

// Seller đăng ký gian hàng mới (có xác thực)
router.post('/stores', verifyToken, registerStore);

module.exports = router;
