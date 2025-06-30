const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/role');
const userController = require('../controllers/userController'); // ✅ import đúng chuẩn

// 📌 [GET] Lấy thông tin người dùng
router.get('/profile', verifyToken, userController.getProfile);

// 📌 [POST] Buyer gửi yêu cầu làm seller
router.post('/request-seller', verifyToken, userController.requestSeller);

// 📌 [GET] Admin lấy danh sách buyer
router.get('/buyers', verifyToken, isAdmin, userController.getBuyers);

router.put('/update-profile', verifyToken, userController.updateProfile); // ✅ Thêm route cập nhật

module.exports = router;
