import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import io from 'socket.io-client';
import styles from './Messages.module.scss';

const socket = io('http://localhost:5000', { path: '/api/socket' });

const MessagePage = () => {
  const location = useLocation();
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

  // ✅ Nhận selectedUser từ location.state
  useEffect(() => {
    if (location.state?.selectedUser) {
      const u = location.state.selectedUser;

      if (typeof u === 'string') {
        // Trường hợp chỉ truyền ID
        setSelectedUser({ _id: u });
      } else {
        // Trường hợp object
        setSelectedUser({
          ...u,
          _id: u._id || u.id,
        });
      }
    }
  }, [location.state]);

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
        const res = await axios.get('/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = String(user._id);
        const otherId = String(selectedUser._id);

        console.log('🔍 Fetching messages for:', { userId, otherId, selectedUser });

        const filtered = res.data.filter((msg) => {
          if (!msg.senderId || !msg.receiverId) return false;

          const sender = String(msg.senderId);
          const receiver = String(msg.receiverId);

          return (
            (sender === userId && receiver === otherId) ||
            (receiver === userId && sender === otherId)
          );
        });

        setMessages(filtered);

        if (selectedUser._id) {
          socket.emit('joinRoom', selectedUser._id);
        }
      } catch (err) {
        console.error('Lỗi khi lấy messages:', err.response?.data || err.message);
      }
    };

    fetchMessages();
  }, [selectedUser, user]);

  useEffect(() => {
    if (user?._id) {
      socket.emit('joinRoom', user._id);
    }

    socket.on('newMessage', (msg) => {
      const sender = msg.senderId ? String(msg.senderId) : '';
      const receiver = msg.receiverId ? String(msg.receiverId) : '';
      const currentUserId = String(user?._id);
      const selectedId = selectedUser ? String(selectedUser._id) : '';

      if (
        selectedUser &&
        ((sender === currentUserId && receiver === selectedId) ||
          (receiver === currentUserId && sender === selectedId))
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('newMessage');
    };
  }, [user, selectedUser]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user?._id || !selectedUser?._id) return;

    const msg = {
      senderId: user._id,
      receiverId: selectedUser._id,
      content: newMessage.trim(),
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
              onClick={() => setSelectedUser({
                ...u,
                _id: u._id || u.id,
              })}
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
            <div className={styles.chatHeader}>
              Đang trò chuyện với: {selectedUser.fullName || 'Người dùng'}
            </div>
            <div className={styles.chatWindow}>
              {messages.length === 0 ? (
                <p className={styles.noMessage}>
                  Chưa có tin nhắn nào với người này.
                </p>
              ) : (
                messages.map((msg, index) => {
                  const sender = msg.senderId ? String(msg.senderId) : '';
                  const isMyMessage = sender === String(user._id);
                  return (
                    <div
                      key={index}
                      className={
                        isMyMessage ? styles.userMessage : styles.shopMessage
                      }
                    >
                      <p>{msg.content}</p>
                      <span className={styles.timestamp}>
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              )}
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
