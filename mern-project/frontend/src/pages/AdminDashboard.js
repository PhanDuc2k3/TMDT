import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('accessToken');

  // Lấy danh sách yêu cầu seller
  const fetchRequests = async () => {
    try {
      const res = await axios.get('/admin/seller-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests);
      setError('');
    } catch (err) {
      console.error('Lỗi khi lấy danh sách yêu cầu seller', err);
      setError('Không thể lấy danh sách yêu cầu seller');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  const approveRequest = async (userId) => {
    try {
      await axios.patch(`/admin/approve-seller/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Duyệt seller thành công!');
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error('Lỗi khi duyệt seller:', err.response?.data || err);
      alert(err.response?.data?.error || '❌ Duyệt thất bại');
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await axios.patch(`/admin/reject-seller/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('❌ Đã từ chối yêu cầu');
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      console.error('Lỗi khi từ chối seller:', err.response?.data || err);
      alert(err.response?.data?.error || '❌ Từ chối thất bại');
    }
  };

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

      {/* Chi tiết yêu cầu */}
      {selectedRequest && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f1f1f1',
          borderRadius: '8px',
          boxShadow: '0 0 8px rgba(0,0,0,0.1)'
        }}>
          <h3>📋 Thông tin yêu cầu của {selectedRequest.fullName}</h3>
          <p><strong>Email:</strong> {selectedRequest.email}</p>
          <p><strong>Số điện thoại:</strong> {selectedRequest.phone || 'Chưa có'}</p>
          <p><strong>Địa chỉ:</strong> {selectedRequest.address || 'Chưa có'}</p>
          <p><strong>Gian hàng:</strong> {selectedRequest.sellerRequest?.store?.name || 'Chưa có'}</p>
          <p><strong>Mô tả:</strong> {selectedRequest.sellerRequest?.store?.description || 'Chưa có mô tả'}</p>
          <p><strong>Logo:</strong><br />
            <img
              src={selectedRequest.sellerRequest?.store?.logoUrl || 'https://example.com/default-logo.png'}
              alt="Logo"
              style={{ maxWidth: '150px', marginTop: '5px' }}
            />
          </p>
          <p><strong>Danh mục:</strong> {selectedRequest.sellerRequest?.store?.category || 'Chưa có danh mục'}</p>
          <p><strong>Đánh giá:</strong> {selectedRequest.sellerRequest?.store?.rating || 'Chưa có'}</p>
          <p><strong>Địa chỉ gian hàng:</strong> {selectedRequest.sellerRequest?.store?.location || 'Chưa có'}</p>
          <p><strong>Trạng thái yêu cầu:</strong> {selectedRequest.sellerRequest?.status}</p>
          <p><strong>Yêu cầu gửi lúc:</strong> {new Date(selectedRequest.sellerRequest?.requestedAt).toLocaleString()}</p>

          <div style={{ marginTop: '15px' }}>
            <button
              onClick={() => approveRequest(selectedRequest._id)}
              style={{
                marginRight: 10,
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              ✅ Duyệt
            </button>
            <button
              onClick={() => rejectRequest(selectedRequest._id)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              ❌ Từ chối
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
