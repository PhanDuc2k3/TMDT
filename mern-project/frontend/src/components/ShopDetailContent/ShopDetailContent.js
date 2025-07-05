// src/components/ShopDetailContent.js

import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom'; // thêm useNavigate
import styles from './ShopDetailContent.module.scss';

const ShopDetailContent = ({ shopId }) => {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // dùng để chuyển trang khi nhấn "Nhắn tin"

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      setLoading(true);
      try {
        const [resShop, resProducts] = await Promise.all([
          axios.get(`/store/stores/${shopId}`),
          axios.get(`/product/by-store/${shopId}`)
        ]);

        setShop(resShop.data);
        setProducts(resProducts.data);
        setError(null);
      } catch (err) {
        console.error('❌ Lỗi khi lấy dữ liệu gian hàng:', err);
        setError('Không thể tải dữ liệu gian hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopAndProducts();
    }
  }, [shopId]);

  const handleMessageClick = () => {
    if (shop?.owner) {
      navigate('/messages', { state: { selectedUser: shop.owner } });
    }
  };

  if (loading) return <p>🔄 Đang tải dữ liệu gian hàng...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!shop) return <p>❌ Không tìm thấy gian hàng.</p>;

  return (
    <div className={styles.shopDetailContainer}>
      <div className={styles.shopInfo}>
        <img
          src={shop.logoUrl || 'https://via.placeholder.com/150'}
          alt={shop.name}
          className={styles.logo}
        />
        <div className={styles.shopText}>
          <h2>{shop.name}</h2>
          <p><strong>Mô tả:</strong> {shop.description}</p>
          <p><strong>Địa điểm:</strong> {shop.location}</p>
          <p><strong>Đánh giá:</strong> {shop.rating} / 5</p>

          {/* ✅ Nút nhắn tin */}
          <button onClick={handleMessageClick} className={styles.messageButton}>
            💬 Nhắn tin
          </button>
        </div>
      </div>

      <h3 className={styles.productTitle}>Sản phẩm của gian hàng</h3>
      <div className={styles.productGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className={styles.productCard}
            >
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/200'}
                alt={product.name}
              />
              <h4>{product.name}</h4>
              <p><strong>Giá:</strong> {product.price.toLocaleString()}₫</p>
            </Link>
          ))
        ) : (
          <p className={styles.noProduct}>Gian hàng này chưa có sản phẩm nào.</p>
        )}
      </div>
    </div>
  );
};

export default ShopDetailContent;
