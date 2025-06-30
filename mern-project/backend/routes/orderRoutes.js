const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');

// Tạo đơn hàng
router.post('/create', verifyToken, orderController.createOrder);

// Lấy danh sách đơn của người dùng
router.get('/my-orders', verifyToken, orderController.getMyOrders);

// Lấy chi tiết đơn hàng theo orderId
router.get('/:orderId', verifyToken, orderController.getOrderById);

// Nhận callback từ Momo cập nhật trạng thái đơn hàng
router.post('/update-status', orderController.updateOrderStatus);

module.exports = router;
