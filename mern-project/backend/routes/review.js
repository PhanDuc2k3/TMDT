const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware'); // middleware kiểm tra token

// Route tạo mới đánh giá
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;
