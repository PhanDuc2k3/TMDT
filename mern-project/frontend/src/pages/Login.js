import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await axios.post('/auth/login', { email, password });
  
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('role', res.data.user.role); // ✅ Lưu role
  
      setMessage('Đăng nhập thành công!');
  
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setMessage(err.response?.data?.error || 'Lỗi đăng nhập');
    }
  };
  

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: 'block', marginBottom: '10px', width: '100%' }}
        />
        <button type="submit">Đăng nhập</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: 'red' }}>{message}</p>}
    </div>
  );
};

export default Login;
