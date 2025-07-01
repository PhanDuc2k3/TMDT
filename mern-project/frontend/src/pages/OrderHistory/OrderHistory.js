import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import styles from './OrderHistory.module.scss';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('No token found, user might not be logged in.');
      return;
    }

    axios.get('/order/my-orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        setError('Không thể tải lịch sử đơn hàng.');
        console.error('Lỗi:', err.response ? err.response.data : err.message);
      });
  }, []);

  return (
    <div className={styles.orderHistory}>
      <h2>📜 Lịch sử mua hàng</h2>
      {error && <p className={styles.error}>{error}</p>}
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
        <p className={styles.empty}>Chưa có đơn hàng nào.</p>
      )}
    </div>
  );
};

export default OrderHistory;
