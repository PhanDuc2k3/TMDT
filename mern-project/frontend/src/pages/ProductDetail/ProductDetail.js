import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { addToCart } from '../../utils/cart';
import styles from './ProductDetail.module.scss';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/product/${productId}`);
        setProduct(res.data);
        setError('');
      } catch (err) {
        console.error('❌ Lỗi khi lấy sản phẩm:', err);
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (quantity <= 0) return alert('Số lượng phải lớn hơn 0');
    addToCart(product, quantity);
    alert('✅ Đã thêm vào giỏ hàng!');
    navigate('/cart'); // Có thể bỏ nếu bạn muốn chỉ ở lại trang chi tiết
  };

  if (loading) return <p>🔄 Đang tải dữ liệu sản phẩm...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!product) return <p>❌ Không tìm thấy sản phẩm.</p>;

  return (
    <div className={styles.productDetailContainer}>
      <div className={styles.imageGallery}>
        {product.images?.map((img, index) => (
          <img key={index} src={img} alt={`Ảnh ${index + 1}`} />
        ))}
      </div>

      <div className={styles.productInfo}>
        <h2>{product.name}</h2>

        <p className={styles.priceOriginal}>
          Giá gốc: {product.price.toLocaleString()}₫
        </p>

        {product.salePrice && (
          <p className={styles.priceSale}>
            Giá khuyến mãi: {product.salePrice.toLocaleString()}₫
          </p>
        )}

        <p><strong>Mô tả:</strong> {product.description}</p>
        <p><strong>Thương hiệu:</strong> {product.brand}</p>
        <p><strong>Phân loại:</strong> {product.subCategory}</p>
        <p><strong>Số lượng còn:</strong> {product.quantity}</p>
        <p><strong>Đã bán:</strong> {product.soldCount}</p>
        <p><strong>Đánh giá:</strong> {product.rating} / 5</p>
        <p><strong>Trạng thái:</strong> {product.isActive ? 'Đang bán' : 'Ngừng bán'}</p>

        <div className={styles.addToCartSection}>
          <label>Số lượng: </label>
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
          <button onClick={handleAddToCart} className={styles.addToCartBtn}>
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
