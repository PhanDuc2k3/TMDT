import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { getCart } from '../../utils/cart';
import { FaShoppingCart } from 'react-icons/fa';
import styles from './Layout.module.scss';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      return;
    }

    axios
      .get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        localStorage.removeItem('accessToken');
        setUser(null);
      });

    // Cập nhật số lượng giỏ hàng mỗi lần route thay đổi
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // Xóa token khi đăng xuất
    localStorage.removeItem('cart'); // Xóa giỏ hàng khi đăng xuất
    setUser(null); // Đặt lại trạng thái người dùng
    navigate('/login'); // Điều hướng người dùng đến trang đăng nhập
  };

  return (
    <div className={styles.layoutContainer}>
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
              <div
                className={styles.cartIcon}
                onClick={() => navigate('/cart')}
                style={{ cursor: 'pointer', position: 'relative', marginRight: '15px' }}
              >
                <FaShoppingCart size={24} />
                {cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      background: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '12px',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>

              {/* Avatar user */}
              <div className={styles.userDropdown}>
                <img
                  src={user.avatarUrl || 'https://via.placeholder.com/40'}
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
                    <Link to="/order-history" className={styles.dropdownItem}>Lịch sử mua hàng</Link> {/* Thêm liên kết lịch sử mua hàng */}
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

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2025 E-commerce. Tất cả các quyền được bảo vệ.</p>
        <div className={styles.socialLinks}>
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">Twitter</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
