import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { FaShoppingCart, FaEnvelope } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext'; // ✅
import styles from './Layout.module.scss';

const Header = () => {
  const { user, setUser } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext); // ✅ lấy từ context
  const [showDropdown, setShowDropdown] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const navigate = useNavigate();

  // Lấy số lượng tin nhắn chưa đọc khi user thay đổi
  useEffect(() => {
    if (!user?._id) return;

    const token = localStorage.getItem('accessToken');
    axios
      .get(`/messages/unread/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessageCount(res.data.unreadCount))
      .catch(() => setMessageCount(0));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('cart');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/" className={styles.logoText}>E-commerce</Link>
      </div>

      <nav>
        <ul className={styles.navList}>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/shops">Gian hàng</Link></li>
        </ul>
      </nav>

      <div className={styles.authSection}>
        {user ? (
          <>
            {/* Icon giỏ hàng */}
            <div className={styles.cartIcon} onClick={() => navigate('/cart')}>
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </div>

            {/* Icon tin nhắn */}
            <div className={styles.messageIcon} onClick={() => navigate('/messages')}>
              <FaEnvelope size={24} />
              {messageCount > 0 && (
                <span className={styles.badge}>{messageCount}</span>
              )}
            </div>

            {/* Avatar + Dropdown */}
            <div className={styles.userDropdown}>
              <img
                src={
                  user.avatarUrl ||
                  'https://via.placeholder.com/40?text=Avatar'
                }
                alt="Avatar"
                className={styles.avatar}
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <Link to="/profile" className={styles.dropdownItem}>Thông tin cá nhân</Link>
                  {user.role === 'seller' && (
                    <Link to="/my-store" className={styles.dropdownItem}>Gian hàng của bạn</Link>
                  )}
                  <Link to="/order-history" className={styles.dropdownItem}>Lịch sử mua hàng</Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>Đăng xuất</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.authLink}>Đăng nhập</Link>
            <Link to="/signup" className={styles.authLink}>Đăng ký</Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
