import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axios';
import styles from './ShopDetail.module.scss';

const ShopDetail = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopAndProducts = async () => {
      setLoading(true);
      try {
        const resShop = await axios.get(`/store/stores/${shopId}`);
        const resProducts = await axios.get(`/product/by-store/${shopId}`);
        if (resShop.status !== 200 || resProducts.status !== 200) {
          throw new Error('Không thể tải dữ liệu gian hàng');
        }        

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
        <div>
          <h2>{shop.name}</h2>
          <p>{shop.description}</p>
          <p>Địa điểm: {shop.location}</p>
          <p>Đánh giá: {shop.rating}/5</p>
        </div>
      </div>

      <h3>Sản phẩm của gian hàng</h3>
      <div className={styles.productGrid}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <img
                src={product.image || 'https://via.placeholder.com/200'}
                alt={product.name}
              />
              <h4>{product.name}</h4>
              <p>{product.price.toLocaleString()}₫</p>
            </div>
          ))
        ) : (
          <p>Gian hàng này chưa có sản phẩm nào.</p>
        )}
      </div>
    </div>
  );
};

export default ShopDetail;
