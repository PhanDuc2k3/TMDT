const mongoose = require('mongoose');
const Message = require('./models/Message');

module.exports = (io) => {
  const userSockets = {}; // Object lưu socket theo shopId

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('joinRoom', (shopId) => {
      socket.join(shopId);
      console.log(`User ${socket.id} joined room ${shopId}`);

      if (!userSockets[shopId]) {
        userSockets[shopId] = [];
      }
      userSockets[shopId].push(socket.id);
    });

    socket.on('sendMessage', async (messageData) => {
      console.log('Sending message:', messageData);

      if (!messageData.senderId || !messageData.receiverId) {
        console.error('Invalid sender or receiver:', messageData.senderId, messageData.receiverId);
        return;
      }

      try {
        if (typeof messageData.receiverId === 'string') {
          if (mongoose.isValidObjectId(messageData.receiverId)) {
            messageData.receiverId = mongoose.Types.ObjectId.createFromHexString(messageData.receiverId);
          } else {
            console.error('Invalid receiverId:', messageData.receiverId);
            return;
          }
        }

        const newMessage = new Message({
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          content: messageData.content,
          timestamp: messageData.timestamp,
        });

        await newMessage.save();

        io.to(messageData.receiverId.toString()).emit('newMessage', newMessage);
        console.log('Message saved and emitted to receiver:', newMessage);
      } catch (err) {
        console.error('Error saving message:', err);
        socket.emit('messageError', 'Error saving your message. Please try again.');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
      for (const shopId in userSockets) {
        userSockets[shopId] = userSockets[shopId].filter((socketId) => socketId !== socket.id);
      }
    });
  });
};
