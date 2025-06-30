const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/create', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);

module.exports = router;
