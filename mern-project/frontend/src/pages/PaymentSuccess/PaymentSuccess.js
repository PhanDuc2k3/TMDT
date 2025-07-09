import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import './PaymentSuccess.module.scss';

const PaymentSuccess = () => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState({});
  const [submitted, setSubmitted] = useState({});

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const resultCode = params.get('resultCode');
  const token = localStorage.getItem('accessToken');

  // Lấy danh sách sản phẩm từ đơn hàng
  useEffect(() => {
    if (orderId && token) {
      axios.get(`/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setProducts(res.data.items); // [{ productId: { full object }, quantity, ... }]
        })
        .catch((err) => {
          console.error('Lỗi lấy đơn hàng:', err.response?.data || err.message);
        });
    }
  }, [orderId, token]);

  // Cập nhật trạng thái đơn hàng sau thanh toán
  useEffect(() => {
    if (orderId && resultCode && token) {
      axios.post('/order/update-status',
        { orderId, resultCode },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((res) => {
        console.log('Đã cập nhật trạng thái:', res.data);
      }).catch((err) => {
        console.error('Lỗi cập nhật trạng thái:', err.response?.data || err.message);
      });
    }
  }, [orderId, resultCode, token]);

  // Gửi đánh giá sản phẩm
  const handleReviewSubmit = async (productId) => {
    try {
      const { rating, comment } = reviews[productId];
      await axios.post('/review', {
        productId,
        orderId,
        rating,
        comment,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubmitted(prev => ({ ...prev, [productId]: true }));
      alert('🎉 Gửi đánh giá thành công!');
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err.response?.data || err.message);
      alert(err.response?.data?.message || '❌ Gửi đánh giá thất bại.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🎉 Thanh toán thành công!</h2>
      <p>Đơn hàng của bạn đã được xử lý.</p>

      <h3 style={{ marginTop: '30px' }}>📝 Đánh giá sản phẩm</h3>
      {products.map((item) => {
        const product = item.productId;
        const image = product?.images?.[0];
        const quantity = item.quantity;

        return (
          <div key={product._id} style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '15px' }}>
            <img
              src={image}
              alt={product.name}
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{ flex: 1 }}>
              <h4>{product.name}</h4>
              <p>Thương hiệu: {product.brand || 'Không rõ'}</p>
              <p>Giá: {product.price?.toLocaleString()} ₫</p>
              <p>Số lượng: {quantity}</p>

              {submitted[product._id] ? (
                <p style={{ color: 'green', marginTop: '10px' }}>✅ Bạn đã đánh giá sản phẩm này</p>
              ) : (
                <>
                  <label>
                    Số sao:
                    <select
                      value={reviews[product._id]?.rating || ''}
                      onChange={e =>
                        setReviews(prev => ({
                          ...prev,
                          [product._id]: {
                            ...prev[product._id],
                            rating: Number(e.target.value),
                          },
                        }))
                      }
                    >
                      <option value="">Chọn sao</option>
                      {[1, 2, 3, 4, 5].map(star => (
                        <option key={star} value={star}>{star}</option>
                      ))}
                    </select>
                  </label>
                  <br />
                  <label>
                    Bình luận:
                    <br />
                    <textarea
                      rows={3}
                      cols={40}
                      value={reviews[product._id]?.comment || ''}
                      onChange={e =>
                        setReviews(prev => ({
                          ...prev,
                          [product._id]: {
                            ...prev[product._id],
                            comment: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                  <br />
                  <button style={{ marginTop: '8px' }} onClick={() => handleReviewSubmit(product._id)}>
                    Gửi đánh giá
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentSuccess;
