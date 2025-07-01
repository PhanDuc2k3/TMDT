import React, { useEffect } from 'react';
import axios from '../../api/axios';  // Đảm bảo axios được cấu hình đúng

const PaymentSuccess = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);  // Lấy query params từ URL
    const orderId = params.get('orderId');
    const resultCode = params.get('resultCode');  // Kết quả thanh toán từ Momo (0: thành công, khác 0: thất bại)

    // Lấy token từ localStorage hoặc cookie
    const token = localStorage.getItem('accessToken');  // Hoặc lấy từ cookie nếu sử dụng cookie

    if (orderId && resultCode && token) {
      // Gửi yêu cầu cập nhật trạng thái đơn hàng
      axios
        .post('/order/update-status', {
          orderId: orderId,
          resultCode: resultCode,  // Giả sử resultCode là thông tin từ Momo
        }, {
          headers: {
            Authorization: `Bearer ${token}`,  // Gửi token trong header (nếu có)
          },
        })
        .then((response) => {
          console.log('Cập nhật trạng thái đơn hàng:', response.data);
        })
        .catch((err) => {
          console.error('Lỗi khi cập nhật trạng thái:', err.response ? err.response.data : err.message);
        });
    } else {
      console.log('Token không tồn tại hoặc thiếu dữ liệu yêu cầu');
    }
  }, []);

  return (
    <div>
      <h2>🎉 Thanh toán thành công!</h2>
      <p>Đơn hàng của bạn đã được xử lý.</p>
    </div>
  );
};

export default PaymentSuccess;
