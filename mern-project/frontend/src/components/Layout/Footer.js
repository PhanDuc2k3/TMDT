import React from 'react';
import styles from './Layout.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>&copy; 2025 E-commerce. Tất cả các quyền được bảo vệ.</p>
      <div className={styles.socialLinks}>
        <a href="#">Facebook</a>
        <a href="#">Instagram</a>
        <a href="#">Twitter</a>
      </div>
    </footer>
  );
};

export default Footer;
