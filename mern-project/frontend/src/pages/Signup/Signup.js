import React, { useState } from 'react';
import axios from '../../api/axios';
import styles from './Signup.module.scss'; // ✅ SCSS module

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
  
    // Kiểm tra dữ liệu form trước khi gửi
    console.log("Dữ liệu gửi đi:", form);  // Xem dữ liệu form
  
    if (!form.email || !form.password || !form.fullName) {
      setMessage('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
  
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(form.email)) {
      setMessage('Vui lòng nhập email hợp lệ.');
      return;
    }
  
    if (form.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
  
    if (form.phone && !/^\d{10,11}$/.test(form.phone)) {
      setMessage('Số điện thoại không hợp lệ.');
      return;
    }
  
    try {
      const res = await axios.post('/auth/signup', form, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true // ✅ thêm dòng này để cho phép gửi nhận cookie
      });
      
  
      setMessage('Đăng ký thành công. Bạn có thể đăng nhập ngay!');
    } catch (err) {
      console.error('Lỗi đăng ký:', err.response);  // Log chi tiết lỗi từ server
      setMessage(err.response?.data?.error || 'Đăng ký thất bại');
    }
  };
  

  return (
    <div className={styles.container}>
      <h2>Đăng ký</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          placeholder="Họ và tên"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="address"
          placeholder="Địa chỉ"
          value={form.address}
          onChange={handleChange}
        />
        <button type="submit">Đăng ký</button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Signup;
