// pages/Signup.js
import React, { useState } from 'react';
import axios from '../api/axios';

const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/signup', form);
      setMessage('Đăng ký thành công. Bạn có thể đăng nhập ngay!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Đăng ký thất bại');
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required />
        <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} />
        <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} />
        <button type="submit">Đăng ký</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default Signup;
