import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './MyStore.module.scss';

const MyStore = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    image: '',
    description: ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/product/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('❌ Lỗi khi lấy sản phẩm:', err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/product/create', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', price: '', image: '', description: '' });
      fetchProducts();
    } catch (err) {
      console.error('❌ Lỗi khi tạo sản phẩm:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error('❌ Lỗi khi xóa sản phẩm:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.myStore}>
      <h2>Gian hàng của bạn</h2>

      <div className={styles.form}>
        <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} />
        <input name="price" placeholder="Giá" value={form.price} onChange={handleChange} />
        <input name="image" placeholder="Link ảnh" value={form.image} onChange={handleChange} />
        <input name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} />
        <button onClick={handleCreate}>Thêm sản phẩm</button>
      </div>

      <div className={styles.productList}>
        {products.length === 0 ? (
          <p>Chưa có sản phẩm nào.</p>
        ) : (
          products.map((p) => (
            <div key={p._id} className={styles.productItem}>
              <img src={p.image} alt={p.name} />
              <div>
                <h4>{p.name}</h4>
                <p>{p.price}₫</p>
                <p>{p.description}</p>
                <button onClick={() => handleDelete(p._id)}>Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyStore;
