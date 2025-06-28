import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';  // Cập nhật đường dẫn nếu cần
import './Profile.scss'; // Đừng quên import file SCSS

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [name, setName] = useState(''); // Tên gian hàng
  const [description, setDescription] = useState(''); // Mô tả gian hàng
  const [logoUrl, setLogoUrl] = useState(''); // URL ảnh logo
  const [category, setCategory] = useState('Khác'); // Danh mục gian hàng
  const [rating, setRating] = useState(0); // Đánh giá gian hàng
  const [location, setLocation] = useState(''); // Địa chỉ gian hàng
  const [isActive, setIsActive] = useState(true); // Trạng thái gian hàng
  const [showForm, setShowForm] = useState(false); // Hiển thị form khi nhấn nút
  const [isSubmitting, setIsSubmitting] = useState(false);  // Trạng thái khi đang gửi yêu cầu
  const navigate = useNavigate();

  // Fetch thông tin người dùng
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

      setUser(res.data);
      console.log('User data fetched:', res.data); // Debug log để kiểm tra dữ liệu
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

  // Xử lý gửi yêu cầu làm seller
  const handleRequestSeller = async () => {
    const token = localStorage.getItem('accessToken');
    const data = {
      name,
      description,
      logoUrl,
      category,
      rating: parseFloat(rating),  // Chuyển đổi rating thành kiểu số
      location,
      isActive,
    };

    // Kiểm tra dữ liệu form trước khi gửi
    if (!name || !description || !logoUrl || !location) {
      setMessage('Vui lòng điền đầy đủ thông tin yêu cầu!');
      return;
    }

    console.log('Data being sent to backend:', JSON.stringify(data));  // Debug log để kiểm tra dữ liệu

    try {
      const res = await axios.post('/user/request-seller', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      <h2 className="profile-header">👤 Thông tin tài khoản</h2>
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
            <div>
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
                    disabled={isSubmitting} // Disable nút khi đang gửi yêu cầu
                  >
                    {isSubmitting ? 'Đang gửi yêu cầu...' : '📤 Gửi yêu cầu làm Seller'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {message && <p className="profile-message">{message}</p>}
    </div>
  );
};

export default Profile;
