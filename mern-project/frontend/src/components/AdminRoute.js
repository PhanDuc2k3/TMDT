// components/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role'); // giả sử bạn đã lưu vào localStorage khi login

  if (!token || role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
