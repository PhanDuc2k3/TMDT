import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios'; // Cập nhật đường dẫn nếu cần
import styles from './Home.module.scss'; // Import SCSS module

const Home = () => {
  const [shops, setShops] = useState([]);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get('/store/stores');
        setShops(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy gian hàng:', err);
      }
    };

    fetchShops();

    const token = localStorage.getItem('accessToken');
    if (token) {
      const fetchUser = async () => {
        try {
          const res = await axios.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
        }
      };
      fetchUser();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className={styles.homeContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.logo}>E-commerce</div>

        <nav>
          <ul className={styles.navList}>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/shops">Gian hàng</Link></li>
            <li><Link to="/cart">Giỏ hàng</Link></li>
          </ul>
        </nav>

        <div className={styles.authSection}>
          {/* MỤC GIAN HÀNG CỦA BẠN (chỉ hiện với seller) */}
          {user?.role === 'seller' && (
            <div className={styles.myStore}>
              <Link to="/my-store" className={styles.myStoreBtn}>
                🏪 Gian hàng của bạn
              </Link>
            </div>
          )}

          {/* Đăng nhập / Dropdown */}
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

      {/* Banner Section */}
      <section className={styles.banner}>
        <div className={styles.bannerText}>
          <h1>Chào mừng đến với sàn thương mại điện tử</h1>
          <p>Mua sắm sản phẩm chất lượng từ các gian hàng uy tín</p>
        </div>
      </section>

      {/* Shops List Section */}
      <section className={styles.shopsSection}>
        <h2>Các gian hàng nổi bật</h2>
        <div className={styles.shopsGrid}>
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop._id} className={styles.shopCard}>
                <img src={shop.logoUrl} alt={shop.name} className={styles.shopImage} />
                <h3>{shop.name}</h3>
                <p>{shop.description}</p>
                <Link to={`/shop/${shop._id}`} className={styles.viewShopBtn}>Xem gian hàng</Link>
              </div>
            ))
          ) : (
            <p>Đang tải gian hàng...</p>
          )}
        </div>
      </section>

      {/* Footer Section */}
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

export default Home;
