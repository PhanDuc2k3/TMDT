import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import styles from './Layout.module.scss';

const Layout = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🔁 Load lại user mỗi lần đổi route (sau khi login xong)
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
  }, [location.pathname]); // 🔥 Đổi path → kiểm tra lại user

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoText}>E-commerce</Link>
        </div>

        <nav>
          <ul className={styles.navList}>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/shops">Gian hàng</Link></li>
            <li><Link to="/cart">Giỏ hàng</Link></li>
          </ul>
        </nav>

        <div className={styles.authSection}>
          {user?.role === 'seller' && (
            <Link to="/my-store" className={styles.myStoreBtn}>🏪 Gian hàng của bạn</Link>
          )}

          {user ? (
            <div className={styles.userDropdown}>
              <span
                className={styles.userName}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user.fullName}
              </span>
              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <Link to="/profile" className={styles.dropdownItem}>Thông tin cá nhân</Link>
                  <button onClick={handleLogout} className={styles.dropdownItem}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.authLink}>Đăng nhập</Link>
              <Link to="/signup" className={styles.authLink}>Đăng ký</Link>
            </>
          )}
        </div>
      </header>

      {/* Nội dung chính */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

      {/* Footer */}
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
