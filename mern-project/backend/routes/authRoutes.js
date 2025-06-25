const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshAccessToken } = require('../controllers/authController');

// Load log để xác nhận route được gắn
console.log('>> authRoutes loaded');

// Đăng ký người dùng
router.post('/signup', registerUser);

// Đăng nhập
router.post('/login', loginUser);

// Làm mới access token
router.post('/refresh-token', refreshAccessToken);

module.exports = router;
