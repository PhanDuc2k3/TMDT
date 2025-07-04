// src/components/ChatSection.js

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import styles from './ChatSection.module.scss';

const ChatSection = ({ shopId, shop }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  // ✅ Load user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error('Lỗi parse user:', err);
      }
    }
  }, []);

  // ✅ Kết nối socket
  useEffect(() => {
    const socketConnection = io('http://localhost:5000', { path: '/api/socket' });

    socketConnection.on('connect', () => {
      console.log('Socket connected:', socketConnection.id);
      setSocket(socketConnection);
      socketConnection.emit('joinRoom', shopId);
    });

    socketConnection.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketConnection.emit('leaveRoom', shopId);
      socketConnection.disconnect();
    };
  }, [shopId]);

  // ✅ Gửi tin nhắn
  const handleSendMessage = () => {
    if (!user || !user.id || !shop || !shop.ownerId) {
      alert('Thiếu thông tin người dùng hoặc cửa hàng');
      return;
    }

    if (!newMessage.trim()) return;

    const messageData = {
      senderId: user.id,
      receiverId: shop.ownerId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    if (socket && socket.connected) {
      socket.emit('sendMessage', messageData);
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');
    } else {
      console.error('Socket chưa kết nối');
    }
  };

  return (
    <div className={styles.chatSection}>
      <h3>💬 Nhắn tin với chủ cửa hàng</h3>

      <div className={styles.chatWindow}>
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className={styles.message}>
              <p>
                <strong>{msg.senderId === user?.id ? '🧑 Bạn' : '🏪 Chủ shop'}:</strong>
                {' '}{msg.content}
              </p>
              <p className={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>Chưa có tin nhắn nào.</p>
        )}
      </div>

      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder={user ? 'Nhập tin nhắn...' : 'Bạn cần đăng nhập để nhắn tin'}
        disabled={!user}
        className={styles.messageInput}
      />

      <button
        onClick={handleSendMessage}
        disabled={!user || !shop?.ownerId || !newMessage.trim()}
        className={styles.sendButton}
      >
        Gửi
      </button>
    </div>
  );
};

export default ChatSection;
