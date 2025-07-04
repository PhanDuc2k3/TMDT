const Message = require('../models/Message');

// Lấy tất cả tin nhắn của người dùng
exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Truy vấn tin nhắn của người dùng (gửi hoặc nhận)
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
};

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, conversationId } = req.body;

    // Kiểm tra xem các dữ liệu có hợp lệ không
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'Sender ID, Receiver ID, and content are required' });
    }

    const newMessage = new Message({ senderId, receiverId, content, conversationId });

    // Lưu tin nhắn vào DB
    await newMessage.save();

    // Phát sự kiện Socket.io để thông báo tin nhắn mới
    req.io.to(receiverId).emit('newMessage', newMessage);

    res.status(200).json(newMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
};

// Lấy số lượng tin nhắn chưa đọc của người dùng
exports.getUnreadMessages = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Kiểm tra xem userId có hợp lệ không
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Truy vấn số lượng tin nhắn chưa đọc
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      readStatus: false,  // Chỉ lấy tin nhắn chưa đọc
    });

    res.status(200).json({ unreadCount });
  } catch (err) {
    console.error('Error fetching unread messages:', err);
    res.status(500).json({ message: 'Error fetching unread messages count', error: err.message });
  }
};

// Đánh dấu tin nhắn là đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;

    // Kiểm tra xem messageId có hợp lệ không
    if (!messageId) {
      return res.status(400).json({ message: 'Message ID is required' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { readStatus: true },
      { new: true }  // Trả về đối tượng đã được cập nhật
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json(updatedMessage);
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ message: 'Error marking message as read', error: err.message });
  }
};
