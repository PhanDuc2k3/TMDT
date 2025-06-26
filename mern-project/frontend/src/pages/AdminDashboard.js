import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null); // Lưu thông tin yêu cầu đang chọn
  const token = localStorage.getItem('accessToken');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/admin/seller-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách yêu cầu seller', err);
    }
  };

  const approveSeller = async (userId) => {
    try {
      const res = await axios.patch(`/admin/approve-seller/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Duyệt seller thành công!");
      fetchRequests(); // cập nhật lại danh sách yêu cầu
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi duyệt seller");
    }
  };

  const rejectSeller = async (userId) => {
    try {
      await axios.patch(`/admin/reject-seller/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("❌ Từ chối yêu cầu thành công!");
      fetchRequests(); // cập nhật lại danh sách yêu cầu
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi từ chối yêu cầu");
    }
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request); // Lưu thông tin yêu cầu vào state để hiển thị
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📥 Yêu cầu làm seller đang chờ duyệt</h2>
      {requests.length === 0 ? (
        <p>✅ Không có yêu cầu nào đang chờ.</p>
      ) : (
        requests.map((user) => (
          <div key={user._id} style={{ borderBottom: '1px solid #ccc', padding: 10 }}>
            <p><strong>{user.fullName}</strong> ({user.email})</p>
            <p>📅 Gửi lúc: {new Date(user.sellerRequest.requestedAt).toLocaleString()}</p>
            <button onClick={() => viewRequestDetails(user)}>👁️ Xem thông tin</button>
            <button onClick={() => approveSeller(user._id)}>✅ Duyệt seller</button>
            <button onClick={() => rejectSeller(user._id)}>❌ Từ chối</button>
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
          <p><strong>Gian hàng:</strong> {selectedRequest.sellerRequest.storeName}</p>
          <p><strong>Mô tả gian hàng:</strong> {selectedRequest.sellerRequest.description}</p>
          <p><strong>Logo:</strong> <img src={selectedRequest.sellerRequest.logoUrl} alt="Logo" style={{ maxWidth: '150px' }} /></p>
          <p><strong>Danh mục:</strong> {selectedRequest.sellerRequest.category}</p>
          <p><strong>Đánh giá:</strong> {selectedRequest.sellerRequest.rating} / 5</p>
          <p><strong>Địa chỉ gian hàng:</strong> {selectedRequest.sellerRequest.location}</p>
          <p><strong>Trạng thái yêu cầu:</strong> {selectedRequest.sellerRequest.status}</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
