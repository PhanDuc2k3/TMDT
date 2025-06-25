import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './Profile.scss'; // Đừng quên import file SCSS

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleRequestSeller = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('/user/request-seller', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(res.data.message);
      fetchProfile(); // reload lại thông tin mới
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Gửi yêu cầu thất bại');
    }
  };

  if (loading) return <p>🔄 Đang tải thông tin người dùng...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-header">
        👤 Thông tin tài khoản
      </h2>
      <div className="profile-info">
        <p><strong>Họ tên:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>
        <p><strong>Địa chỉ:</strong> {user.address}</p>
        <p><strong>Vai trò:</strong> {user.role}</p>
      </div>

      {user.role === 'buyer' && (
        <div className="profile-button-container">
          {user.sellerRequest?.status === 'pending' ? (
            <p className="status-pending">⏳ Yêu cầu seller đang chờ duyệt</p>
          ) : user.sellerRequest?.status === 'approved' ? (
            <p className="status-approved">✅ Bạn đã được duyệt làm seller</p>
          ) : (
            <button className="profile-button" onClick={handleRequestSeller}>📤 Gửi yêu cầu làm Seller</button>
          )}
        </div>
      )}

      {message && <p className="profile-message">{message}</p>}
    </div>
  );
};

export default Profile;
