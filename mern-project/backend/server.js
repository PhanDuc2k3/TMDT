const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

// ✅ Cấu hình CORS đúng (chỉ dùng 1 lần DUY NHẤT)
const corsOptions = {
  origin: 'http://localhost:3000', // frontend
  credentials: true,               // cho phép gửi cookie
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ Import routes
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// ✅ Load routes
app.use('/api/admin', adminRoutes); 
app.use('/api/store', storeRoutes); 
app.use('/api/auth', authRoutes);   
app.use('/api/user', userRoutes);

// ✅ Route kiểm tra
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ Kết nối MongoDB và khởi động server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
  });
