import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
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
    const storeName = prompt("Nhập tên cửa hàng cho seller:");
    if (!storeName) return;

    try {
      await axios.patch(`/admin/approve-seller/${userId}`, {
        storeName,
        description: "Cửa hàng mới được duyệt"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Duyệt seller thành công!");
      fetchRequests(); // cập nhật lại danh sách
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi duyệt seller");
    }
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
            <button onClick={() => approveSeller(user._id)}>✅ Duyệt seller</button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
