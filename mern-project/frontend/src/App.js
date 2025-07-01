import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Profile from './pages/Profile/Profile';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home/Home';
import ShopDetail from './pages/ShopDetail/ShopDetail';
import MyStore from './pages/MyStore/MyStore';
import Layout from './components/Layout/Layout';
import EditProfile from './pages/EditProfile/EditProfile'; // ✅ Đúng folder Profile
import ProductDetail from './pages/ProductDetail/ProductDetail'; // ✅ Đúng folder ProductDetail
import CartPage from './pages/CartPage/CartPage'; // Thêm dòng này
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess'; // Thêm dòng này
import OrderHistory from './pages/OrderHistory/OrderHistory';
function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Tất cả route con đều được bọc trong Layout */}
        <Route path="/" element={<Layout />}>
          {/* Trang chủ */}
          <Route index element={<Home />} />

          {/* Các trang công khai */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="shop/:shopId" element={<ShopDetail />} />
          <Route path="my-store" element={<MyStore />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route
            path="cart"
            element={
              <PrivateRoute>
                <CartPage />
              </PrivateRoute>
            }
          />
          {/* Trang cá nhân (yêu cầu đăng nhập) */}
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="order-history"
            element={
              <PrivateRoute>
                <OrderHistory />
              </PrivateRoute>
            }
          />

          {/* Trang chỉnh sửa thông tin (yêu cầu đăng nhập) */}
          <Route
            path="edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />

          {/* Trang admin (yêu cầu role admin) */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
