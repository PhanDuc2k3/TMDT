const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Lấy tất cả tin nhắn của người dùng
router.get('/:userId', messageController.getMessages);

// Gửi tin nhắn
router.post('/send', messageController.sendMessage);

// Lấy số lượng tin nhắn chưa đọc của người dùng
router.get('/unread/:userId', messageController.getUnreadMessages);

// Đánh dấu tin nhắn là đã đọc
router.post('/markAsRead', messageController.markAsRead);  // Route mới để đánh dấu tin nhắn đã đọc

module.exports = router;
