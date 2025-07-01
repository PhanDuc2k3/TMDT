import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import styles from './MyStore.module.scss';

const RevenueStats = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get('/order/my-sales', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy doanh thu:', err);
        setError('Không thể lấy thống kê doanh thu.');
      }
    };

    fetchRevenue();
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!stats) return <p>Đang tải thống kê...</p>;

  return (
    <div className={styles.revenueStats}>
      <h3>📊 Thống kê doanh thu</h3>
      <p><strong>Tổng doanh thu:</strong> {stats.totalRevenue.toLocaleString()}₫</p>
      <p><strong>Tổng đơn hàng:</strong> {stats.totalOrders}</p>
      <p><strong>Sản phẩm đã bán:</strong> {stats.totalProductsSold}</p>
    </div>
  );
};

export default RevenueStats;
