import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('accessToken');

  // Fetch danh sách yêu cầu seller từ backend
  const fetchRequests = async () => {
    try {
      const res = await axios.get('/admin/seller-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests);
      setError(''); // Reset lỗi khi có dữ liệu
    } catch (err) {
      console.error('Lỗi khi lấy danh sách yêu cầu seller', err);
      setError('Không thể lấy danh sách yêu cầu seller');
    }
  };

  // Xem chi tiết yêu cầu seller
  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📥 Yêu cầu làm seller đang chờ duyệt</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {requests.length === 0 ? (
        <p>✅ Không có yêu cầu nào đang chờ.</p>
      ) : (
        requests.map((user) => (
          <div key={user._id} style={{ borderBottom: '1px solid #ccc', padding: 10 }}>
            <p><strong>{user.fullName}</strong> ({user.email})</p>
            <p>📅 Gửi lúc: {new Date(user.sellerRequest?.requestedAt).toLocaleString()}</p>
            <button onClick={() => viewRequestDetails(user)}>👁️ Xem thông tin</button>
          </div>
        ))
      )}

      {/* Hiển thị thông tin yêu cầu nếu chọn */}
      {selectedRequest && (
  <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
    <h3>Thông tin yêu cầu của {selectedRequest.fullName}</h3>
    <p><strong>Email:</strong> {selectedRequest.email}</p>
    <p><strong>Số điện thoại:</strong> {selectedRequest.phone}</p>
    <p><strong>Địa chỉ:</strong> {selectedRequest.address}</p>
    <p><strong>Gian hàng:</strong> {selectedRequest.sellerRequest?.store?.name || 'Chưa có gian hàng'}</p>
    <p><strong>Mô tả gian hàng:</strong> {selectedRequest.sellerRequest?.store?.description || 'Chưa có mô tả'}</p>
    <p><strong>Logo:</strong> <img src={selectedRequest.sellerRequest?.store?.logoUrl || 'https://example.com/default-logo.png'} alt="Logo" style={{ maxWidth: '150px' }} /></p>
    <p><strong>Danh mục:</strong> {selectedRequest.sellerRequest?.store?.category || 'Chưa có danh mục'}</p>
    <p><strong>Đánh giá:</strong> {selectedRequest.sellerRequest?.store?.rating || 'Chưa có đánh giá'}</p>
    <p><strong>Địa chỉ gian hàng:</strong> {selectedRequest.sellerRequest?.store?.location || 'Chưa có địa chỉ'}</p>
    <p><strong>Trạng thái:</strong> {selectedRequest.sellerRequest?.status || 'Chưa có trạng thái'}</p>
    <p><strong>Yêu cầu gửi lúc:</strong> {new Date(selectedRequest.sellerRequest?.requestedAt).toLocaleString()}</p>
  </div>
)}

    </div>
  );
};

export default AdminDashboard;



