import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng', err);
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p>🔄 Đang tải thông tin người dùng...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>👤 Thông tin tài khoản</h2>
      <p><strong>Họ tên:</strong> {user.fullName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Số điện thoại:</strong> {user.phone}</p>
      <p><strong>Địa chỉ:</strong> {user.address}</p>
      <p><strong>Vai trò:</strong> {user.role}</p>
    </div>
  );
};

export default Profile;
