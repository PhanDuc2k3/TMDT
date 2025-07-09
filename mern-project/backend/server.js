const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
dotenv.config();

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/payment');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/review'); // ✅ Thêm route đánh giá

// Sử dụng routes
app.use('/api/admin', adminRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/review', reviewRoutes); // ✅ Mount endpoint review

// Route test
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Kết nối MongoDB và Socket.io
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    const io = socketIo(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/api/socket',
    });

    require('./socket')(io); // Gọi socket xử lý

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
  });
