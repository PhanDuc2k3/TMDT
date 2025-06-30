import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import styles from './MyStore.module.scss';

const MyStore = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    price: '',
    salePrice: '',
    images: '',
    description: '',
    brand: '',
    subCategory: '',
    quantity: ''
  });
  const [editingId, setEditingId] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        quantity: parseInt(form.quantity) || 0,
        images: form.images ? [form.images] : []
      };

      await axios.post('/product/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('❌ Lỗi khi tạo sản phẩm:', err);
    }
  };

  const startEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      salePrice: product.salePrice || '',
      images: product.images?.[0] || '',
      description: product.description || '',
      brand: product.brand || '',
      subCategory: product.subCategory || '',
      quantity: product.quantity || ''
    });
    setEditingId(product._id);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        quantity: parseInt(form.quantity) || 0,
        images: form.images ? [form.images] : []
      };

      await axios.put(`/product/${editingId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error('❌ Lỗi khi cập nhật sản phẩm:', err);
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

  const resetForm = () => {
    setForm({
      name: '',
      price: '',
      salePrice: '',
      images: '',
      description: '',
      brand: '',
      subCategory: '',
      quantity: ''
    });
    setEditingId(null);
  };

  return (
    <div className={styles.myStore}>
      <h2>Gian hàng của bạn</h2>

      <div className={styles.form}>
        <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} />
        <input name="price" placeholder="Giá gốc" value={form.price} onChange={handleChange} />
        <input name="salePrice" placeholder="Giá khuyến mãi (nếu có)" value={form.salePrice} onChange={handleChange} />
        <input name="images" placeholder="Link ảnh (1 ảnh)" value={form.images} onChange={handleChange} />
        <input name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} />
        <input name="brand" placeholder="Thương hiệu" value={form.brand} onChange={handleChange} />
        <input name="subCategory" placeholder="Phân loại nhỏ" value={form.subCategory} onChange={handleChange} />
        <input name="quantity" placeholder="Số lượng" value={form.quantity} onChange={handleChange} />

        {editingId ? (
          <>
            <button onClick={handleUpdate}>Cập nhật sản phẩm</button>
            <button className={styles.cancelBtn} onClick={resetForm}>Hủy</button>
          </>
        ) : (
          <button onClick={handleCreate}>Thêm sản phẩm</button>
        )}
      </div>

      <div className={styles.productList}>
        {products.length === 0 ? (
          <p>Chưa có sản phẩm nào.</p>
        ) : (
          products.map((p) => (
            <div key={p._id} className={styles.productItem}>
              {p.images?.length > 0 && <img src={p.images[0]} alt={p.name} />}
              <div>
                <h4>{p.name}</h4>
                <p><strong>Giá:</strong> {p.price}₫</p>
                {p.salePrice && <p><strong>Giá KM:</strong> {p.salePrice}₫</p>}
                <p><strong>Phân loại:</strong> {p.subCategory}</p>
                <p><strong>Thương hiệu:</strong> {p.brand}</p>
                <p><strong>Số lượng còn:</strong> {p.quantity}</p>
                <p>{p.description}</p>
                <div className={styles.actionButtons}>
  <button className={styles.editBtn} onClick={() => startEdit(p)}>Sửa</button>
  <button className={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Xóa</button>
</div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyStore;
