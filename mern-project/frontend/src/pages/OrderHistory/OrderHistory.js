import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Import axios instance

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null); // To handle errors

  useEffect(() => {
    const token = localStorage.getItem('accessToken'); // Get token from localStorage
    if (!token) {
      console.log('No token found, user might not be logged in.');
      return;
    }

    // Fetch order data from the API
    axios.get('/order/my-orders', { // Đổi thành '/my-orders' để trùng với backend
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log('Orders fetched:', res.data);
        setOrders(res.data);
      })
      .catch((err) => {
        console.error('Lỗi khi lấy lịch sử đơn hàng:', err.response ? err.response.data : err.message);
      });
      
  }, []);

  return (
    <div>
      <h2>📜 Lịch sử mua hàng</h2>
      {error && <p>{error}</p>} {/* Show error message if any */}
      {orders.length > 0 ? (
        <ul>
          {orders.map((order, idx) => (
            <li key={idx}>
              <h4>Đơn hàng #{order._id}</h4>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} x {item.quantity} - {item.price.toLocaleString()}₫
                  </li>
                ))}
              </ul>
              <p>Tổng tiền: {order.totalAmount.toLocaleString()}₫</p>
              <p>Status: {order.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Chưa có đơn hàng nào.</p>
      )}
    </div>
  );
};

export default OrderHistory;
