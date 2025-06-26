import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Profile from './pages/Profile/Profile';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home/Home';  // Import Home page

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang chủ - Public */}
        <Route path="/" element={<Home />} />  {/* Đường dẫn trang chủ */}

        {/* Đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Đăng ký */}
        <Route path="/signup" element={<Signup />} />

        {/* Trang profile dành cho người dùng đã đăng nhập */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Trang admin dành riêng cho admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
