import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import styles from './Login.module.scss';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gửi thông tin đăng nhập
      const res = await axios.post('/auth/login', { email, password });
      console.log('✅ Login response:', res.data);

      const token = res.data.accessToken;
      localStorage.setItem('accessToken', token);
      console.log('✅ Token saved to localStorage:', token);

      // Lấy thông tin user đầy đủ
      const profileRes = await axios.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('✅ Full user profile:', profileRes.data);

      // Cập nhật vào context
      setUser(profileRes.data);
      console.log('✅ setUser updated context');

      setMessage('Đăng nhập thành công!');

      // Điều hướng theo vai trò
      if (profileRes.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Lỗi đăng nhập:', err.response?.data || err.message);
      setMessage(err.response?.data?.error || 'Lỗi đăng nhập');
    }
  };

  return (
    <div className={styles.container}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>
      {message && <p className={styles.error}>{message}</p>}
    </div>
  );
};

export default Login;
