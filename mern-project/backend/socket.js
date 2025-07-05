const mongoose = require('mongoose');
const Message = require('./models/Message');

module.exports = (io) => {
  const userSockets = {}; // Object lưu socket theo userId

  io.on('connection', (socket) => {
    console.log('✅ A user connected:', socket.id);

    // Khi client join vào phòng theo userId
    socket.on('joinRoom', (userId) => {
      socket.join(userId);
      console.log(`➡️ Socket ${socket.id} joined room ${userId}`);

      if (!userSockets[userId]) {
        userSockets[userId] = [];
      }
      userSockets[userId].push(socket.id);
    });

    // Gửi và lưu tin nhắn
    socket.on('sendMessage', async (messageData) => {
      console.log('📩 Client gửi tin nhắn:', messageData);

      const { senderId, receiverId, content, timestamp } = messageData;

      // Kiểm tra sender/receiver hợp lệ
      if (!senderId || !receiverId || !content) {
        console.error('❌ Thiếu senderId, receiverId hoặc content');
        return;
      }

      try {
        const sender = mongoose.Types.ObjectId.isValid(senderId)
          ? new mongoose.Types.ObjectId(senderId)
          : null;

        const receiver = mongoose.Types.ObjectId.isValid(receiverId)
          ? new mongoose.Types.ObjectId(receiverId)
          : null;

        if (!sender || !receiver) {
          console.error('❌ senderId hoặc receiverId không hợp lệ');
          return;
        }

        const newMessage = new Message({
          senderId: sender,
          receiverId: receiver,
          content,
          timestamp: timestamp || new Date(),
        });

        await newMessage.save();

        io.to(receiver.toString()).emit('newMessage', newMessage);
        console.log('✅ Tin nhắn đã lưu và gửi đến người nhận:', newMessage);
      } catch (err) {
        console.error('❌ Lỗi khi lưu tin nhắn:', err);
        socket.emit('messageError', 'Không thể gửi tin nhắn, hãy thử lại');
      }
    });

    // Khi user disconnect
    socket.on('disconnect', () => {
      console.log('❎ User disconnected', socket.id);
      for (const userId in userSockets) {
        userSockets[userId] = userSockets[userId].filter(id => id !== socket.id);
      }
    });
  });
};
