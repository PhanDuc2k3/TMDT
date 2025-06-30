const Order = require('../models/Order');

// Tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống.' });
    }

    const order = new Order({
      userId: req.user.id,
      items,
      totalAmount,
    });

    await order.save();

    res.json({ message: 'Đặt hàng thành công!', orderId: order._id });
  } catch (err) {
    console.error('Lỗi tạo đơn hàng:', err);
    res.status(500).json({ message: 'Đặt hàng thất bại!' });
  }
};

// Lấy danh sách đơn hàng của người dùng
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Lỗi lấy đơn hàng:', err);
    res.status(500).json({ message: 'Không thể lấy đơn hàng' });
  }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn này' });
    }

    res.json(order);
  } catch (err) {
    console.error('Lỗi lấy chi tiết đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái đơn hàng khi nhận callback từ Momo
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, resultCode } = req.body;

    if (!orderId || typeof resultCode === 'undefined') {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (resultCode == 0) {
      order.status = 'Đã thanh toán';
      await order.save();
      return res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
    } else {
      return res.json({ message: 'Thanh toán thất bại, trạng thái đơn không thay đổi' });
    }
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
