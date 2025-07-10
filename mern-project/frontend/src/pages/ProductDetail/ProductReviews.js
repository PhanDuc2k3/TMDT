import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import styles from './ProductDetail.module.scss';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: '', comment: '' });

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/review/product/${productId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error('❌ Lỗi khi lấy đánh giá:', err);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleReviewSubmit = async () => {
    try {
      await axios.post('/review', {
        productId,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      alert('🎉 Đánh giá của bạn đã được gửi!');
      setNewReview({ rating: '', comment: '' });
      fetchReviews(); // Cập nhật lại danh sách
    } catch (err) {
      console.error('❌ Lỗi khi gửi đánh giá:', err);
      alert('❌ Gửi đánh giá thất bại.');
    }
  };

  return (
    <div className={styles.reviewsSection}>
      <h3>Đánh giá sản phẩm</h3>
      <div className={styles.reviewsList}>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className={styles.review}>
              <div className={styles.userInfo}>
                <img
                  src={review.user.avatarUrl || '/default-avatar.png'}
                  alt={review.user.fullName}
                  className={styles.avatar}
                />
                <span className={styles.username}>{review.user.fullName}</span>
              </div>
              <div className={styles.reviewContent}>
                <div className={styles.rating}>⭐ {review.rating}</div>
                <div className={styles.comment}><p>{review.comment}</p></div>
              </div>
            </div>
          ))
        ) : (
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        )}
      </div>

    </div>
  );
};

export default ProductReviews;
