const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');
router.get('/', verifyToken, messageController.getMessages);

// Lấy danh sách hội thoại
router.get('/conversations', verifyToken, messageController.getConversations);

// Lấy tất cả tin nhắn của người dùng
router.get('/:userId', messageController.getMessages);

// Gửi tin nhắn
router.post('/send', messageController.sendMessage);

// Lấy số lượng tin nhắn chưa đọc của người dùng
router.get('/unread/:userId', messageController.getUnreadMessages);

// Đánh dấu tin nhắn là đã đọc
router.post('/markAsRead', messageController.markAsRead);

module.exports = router;
