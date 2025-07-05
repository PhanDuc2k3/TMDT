import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import io from 'socket.io-client';
import styles from './Messages.module.scss';

const socket = io('http://localhost:5000', { path: '/api/socket' });

const MessagePage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ ...parsed, _id: parsed._id || parsed.id });
      } catch (e) {
        console.error('Lỗi parse user từ localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get('/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy conversations:', err.response?.data || err.message);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const token = localStorage.getItem('accessToken');

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          

        const userId = user._id.toString();
        const otherId = selectedUser._id.toString();

        const filtered = res.data.filter((msg) => {
          const sender = msg.senderId?.toString?.() || msg.senderId;
          const receiver = msg.receiverId?.toString?.() || msg.receiverId;
          return (
            (sender === userId && receiver === otherId) ||
            (receiver === userId && sender === otherId)
          );
        });

        setMessages(filtered);
        socket.emit('joinRoom', selectedUser._id);
      } catch (err) {
        console.error('Lỗi khi lấy messages:', err.response?.data || err.message);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  useEffect(() => {
    if (!user) return;
  
    socket.emit('joinRoom', user._id); // ✅ join phòng cá nhân
  
    socket.on('newMessage', (msg) => {
      const sender = msg.senderId?.toString?.() || msg.senderId;
      const receiver = msg.receiverId?.toString?.() || msg.receiverId;
  
      const currentUserId = user._id?.toString();
      const selectedId = selectedUser?._id?.toString();
  
      if (
        selectedUser &&
        ((sender === currentUserId && receiver === selectedId) ||
          (receiver === currentUserId && sender === selectedId))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
  
      // ✅ Nếu chưa mở khung chat với người gửi, có thể cập nhật cuộc hội thoại
    });
  
    return () => {
      socket.off('newMessage');
    };
  }, [user, selectedUser]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !user || !selectedUser) return;

    const msg = {
      senderId: user.id || user._id,
      receiverId: selectedUser._id,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', msg);
    setNewMessage('');
  };

  return (
    <div className={styles.messagePage}>
      <div className={styles.sidebar}>
        <h3>💬 Tin nhắn</h3>
        <ul className={styles.conversationList}>
          {conversations.map((u) => (
            <li
              key={u._id}
              className={`${styles.conversationItem} ${
                selectedUser?._id === u._id ? styles.active : ''
              }`}
              onClick={() => {
                setSelectedUser(u);
              }}
            >
              <img
                src={u.avatar || '/default-avatar.png'}
                alt={u.fullName}
                className={styles.shopLogo}
              />
              <div>
                <span>{u.fullName}</span>
                <p className={styles.lastMessage}>{u.lastMessage}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.chatArea}>
        {selectedUser ? (
          <>
            <div className={styles.chatHeader}>Đang trò chuyện với: {selectedUser.fullName}</div>
            <div className={styles.chatWindow}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${
                    (msg.senderId?.toString?.() || msg.senderId) === user._id
                      ? styles.userMessage
                      : styles.shopMessage
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className={styles.inputArea}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={handleSendMessage}>Gửi</button>
            </div>
          </>
        ) : (
          <p>Chọn một người để bắt đầu trò chuyện</p>
        )}
      </div>
    </div>
  );
};

export default MessagePage;
