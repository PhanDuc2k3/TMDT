const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Lấy tất cả tin nhắn giữa user hiện tại và các người khác
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid or missing user ID' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
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

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'Sender ID, Receiver ID, and content are required' });
    }

    const newMessage = new Message({ senderId, receiverId, content, conversationId });
    await newMessage.save();

    req.io?.to(receiverId).emit('newMessage', newMessage);

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

    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      readStatus: false,
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

    if (!messageId) {
      return res.status(400).json({ message: 'Message ID is required' });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { readStatus: true },
      { new: true }
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

// Lấy danh sách người dùng đã từng nhắn tin với user hiện tại
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.find({
      $or: [
        { senderId: userObjectId },
        { receiverId: userObjectId }
      ]
    }).sort({ timestamp: -1 });

    const conversationMap = new Map();

    for (const msg of messages) {
      const otherUserId = msg.senderId.equals(userObjectId)
        ? msg.receiverId.toString()
        : msg.senderId.toString();

      // Nếu chưa có trong danh sách thì thêm
      if (!conversationMap.has(otherUserId)) {
        const user = await User.findById(otherUserId).select('fullName avatarUrl');

        // 👉 Log để kiểm tra dữ liệu avatarUrl
        console.log('📦 Found user in conversation:', {
          _id: user?._id,
          fullName: user?.fullName,
          avatarUrl: user?.avatarUrl,
        });

        if (user) {
          conversationMap.set(otherUserId, {
            _id: user._id,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl || null, // fallback nếu thiếu
            lastMessage: msg.content,
            timestamp: msg.timestamp,
          });
        }
      }
    }

    res.status(200).json([...conversationMap.values()]);
  } catch (err) {
    console.error('❌ Error fetching conversations:', err);
    res.status(500).json({ message: 'Error fetching conversations', error: err.message });
  }
};

