const Order = require('../models/Order.js');

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

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Lỗi lấy đơn hàng:', err);
    res.status(500).json({ message: 'Không thể lấy đơn hàng' });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};
