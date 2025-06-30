import React from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  
  // Đọc tham số Momo trả về nếu cần
  const resultCode = searchParams.get('resultCode');

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎉 Thanh toán thành công!</h2>
      {resultCode && <p>Mã kết quả: {resultCode}</p>}
      <p>Cảm ơn bạn đã mua sắm!</p>
    </div>
  );
};

export default PaymentSuccess;
