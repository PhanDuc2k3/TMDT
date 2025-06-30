import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './EditProfile.scss';

const EditProfile = () => {
  const [user, setUser] = useState({
    fullName: '',
    phone: '',
    address: '',
    avatarUrl: '',
  });
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
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
        avatarUrl: res.data.avatarUrl || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng:', err);
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.put('/user/update-profile', user, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('✅ Cập nhật thông tin thành công');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      setMessage(err.response?.data?.error || '❌ Cập nhật thất bại');
    }
  };

  if (loading) return <p>🔄 Đang tải dữ liệu...</p>;

  return (
    <div className="edit-profile-container">
      <h2 className="edit-profile-header">✏️ Sửa thông tin cá nhân</h2>

      <div className="edit-profile-content">
        <div className="edit-profile-left">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">Không có ảnh</div>
          )}
        </div>

        <div className="edit-profile-right">
          <form className="edit-profile-form" onSubmit={handleSubmit}>
            <label>
              Họ tên:
              <input
                type="text"
                name="fullName"
                value={user.fullName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Số điện thoại:
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              Địa chỉ:
              <input
                type="text"
                name="address"
                value={user.address}
                onChange={handleChange}
              />
            </label>

            <label>
              Ảnh đại diện (URL):
              <input
                type="text"
                name="avatarUrl"
                value={user.avatarUrl}
                onChange={handleChange}
              />
            </label>

            <div className="button-group">
              <button type="submit" className="save-button">
                💾 Lưu thay đổi
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/profile')}
              >
                ⬅️ Quay lại
              </button>
            </div>
          </form>
        </div>
      </div>

      {message && <p className="edit-message">{message}</p>}
    </div>
  );
};

export default EditProfile;
