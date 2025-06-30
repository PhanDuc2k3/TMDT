import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import './Profile.scss';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [category, setCategory] = useState('Khác');
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin người dùng', err);
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRequestSeller = async () => {
    const token = localStorage.getItem('accessToken');
    const data = {
      name,
      description,
      logoUrl,
      category,
      rating: parseFloat(rating),
      location,
      isActive,
    };

    if (!name || !description || !logoUrl || !location) {
      setMessage('Vui lòng điền đầy đủ thông tin yêu cầu!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post('/user/request-seller', data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message);
      fetchProfile();
      setIsSubmitting(false);
    } catch (err) {
      setMessage(err.response?.data?.error || '❌ Gửi yêu cầu thất bại');
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>🔄 Đang tải thông tin người dùng...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-header">👤 Thông tin tài khoản</h2>

      <div className="profile-content">
        <div className="profile-left">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">Không có ảnh</div>
          )}
        </div>

        <div className="profile-right">
          <div className="profile-info">
            <p><strong>Họ tên:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Số điện thoại:</strong> {user.phone}</p>
            <p><strong>Địa chỉ:</strong> {user.address}</p>
            <p><strong>Vai trò:</strong> {user.role}</p>
          </div>
        </div>
      </div>

      {/* Bộ 3 nút luôn hiển thị */}
      <div className="profile-button-container">
        <div className="button-left">
          <button className="profile-button" onClick={() => navigate('/edit-profile')}>
            ✏️ Sửa thông tin
          </button>
          <button className="profile-button" onClick={() => navigate('/change-password')}>
            🔒 Đổi mật khẩu
          </button>
        </div>

        <div className="button-right">
          <button className="profile-button back-button" onClick={() => navigate('/')}>
            ⬅️ Quay lại trang chủ
          </button>
        </div>
      </div>

      {/* Phần gửi yêu cầu Seller */}
      {user.role === 'buyer' && (
        <div className="profile-button-container">
          {user.sellerRequest?.status === 'pending' ? (
            <p className="status-pending">⏳ Yêu cầu seller đang chờ duyệt</p>
          ) : user.sellerRequest?.status === 'approved' ? (
            <p className="status-approved">✅ Bạn đã được duyệt làm seller</p>
          ) : (
            <>
              {!showForm ? (
                <button className="profile-button" onClick={() => setShowForm(true)}>
                  Gửi yêu cầu làm Seller
                </button>
              ) : (
                <div className="form-container">
                  <input
                    type="text"
                    placeholder="Tên gian hàng"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Mô tả gian hàng"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="URL ảnh logo"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="input-field"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="Điện tử">Điện tử</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="Mỹ phẩm">Mỹ phẩm</option>
                    <option value="Gia dụng">Gia dụng</option>
                    <option value="Thực phẩm">Thực phẩm</option>
                    <option value="Khác">Khác</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Đánh giá gian hàng"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    min="0"
                    max="5"
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ gian hàng"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-field"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Gian hàng hoạt động
                  </label>
                  <button
                    className="profile-button"
                    onClick={handleRequestSeller}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang gửi yêu cầu...' : '📤 Gửi yêu cầu làm Seller'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {message && <p className="profile-message">{message}</p>}
    </div>
  );
};

export default Profile;
