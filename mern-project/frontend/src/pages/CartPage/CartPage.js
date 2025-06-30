import React, { useEffect, useState } from 'react';
import { getCart, updateQuantity, removeFromCart } from '../../utils/cart';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import styles from './CartPage.module.scss';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleQuantityChange = (productId, quantity) => {
    if (quantity <= 0) return;
    updateQuantity(productId, quantity);
    setCart(getCart());
  };

  const handleRemove = (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      removeFromCart(productId);
      setCart(getCart());
    }
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckoutMomo = async () => {
    if (cart.length === 0) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(
        '/payment/create_momo',
        { totalAmount: totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.payUrl) {
        window.location.href = res.data.payUrl;
      }
    } catch (err) {
      console.error('Lỗi thanh toán Momo:', err);
      alert('Không thể tạo thanh toán Momo.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <h2 className={styles.cartTitle}>🛒 Giỏ hàng trống</h2>
        <button onClick={() => navigate('/')}>Quay lại mua sắm</button>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h2 className={styles.cartTitle}>🛒 Giỏ hàng của bạn</h2>
      {cart.map((item) => (
        <div key={item.productId} className={styles.cartItem}>
          <img src={item.image} alt={item.name} />
          <div className={styles.itemInfo}>
            <div className={styles.itemName}>{item.name}</div>
            <div className={styles.itemPrice}>
              Giá: {item.price.toLocaleString()}₫
            </div>
            <input
              type="number"
              min="1"
              className={styles.quantityInput}
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(item.productId, parseInt(e.target.value))
              }
            />
            <button
              className={styles.removeBtn}
              onClick={() => handleRemove(item.productId)}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}

      <div className={styles.totalPrice}>
        Tổng cộng: {totalPrice.toLocaleString()}₫
      </div>
      <button
        className={styles.checkoutBtn}
        onClick={handleCheckoutMomo}
      >
        Thanh toán bằng Momo
      </button>
    </div>
  );
};

export default CartPage;
