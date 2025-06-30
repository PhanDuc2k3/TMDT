import React, { useEffect, useState } from 'react';

const PaymentSuccess = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('recentOrder');
    if (savedOrder) {
      const items = JSON.parse(savedOrder);
      setOrderItems(items);

      const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      setTotal(sum);
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎉 Thanh toán thành công!</h2>
      <h3>🧾 Chi tiết đơn hàng:</h3>
      {orderItems.length > 0 ? (
        <ul>
          {orderItems.map((item, idx) => (
            <li key={idx}>
              {item.name} - {item.quantity} x {item.price.toLocaleString()}₫
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có sản phẩm trong đơn hàng.</p>
      )}

      <h3>Tổng tiền: {total.toLocaleString()}₫</h3>
      <p>Cảm ơn bạn đã mua sắm!</p>
    </div>
  );
};

export default PaymentSuccess;
