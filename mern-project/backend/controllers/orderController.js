const Order = require('../models/Order');
const Product = require('../models/Product');

// Tạo đơn hàng
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống.' });
    }

    // Duyệt qua từng item để gán thêm trường "store"
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);

        return {
          productId: product._id,
          store: product.store, // ⭐ Gán store từ product
          name: product.name,
          price: item.price,
          quantity: item.quantity
        };
      })
    );

    const order = new Order({
      userId: req.user.id,
      items: enrichedItems,
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

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'Không có đơn hàng nào' });
    }

    res.json(orders);
  } catch (err) {
    console.error('Lỗi khi lấy đơn hàng:', err);
    res.status(500).json({ message: 'Không thể lấy đơn hàng' });
  }
};


// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.productId'); // ✅ thêm dòng này

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const userId = String(req.user.id);
    const role = req.user.role;
    const storeId = req.user.storeId;

    if (role === 'admin') return res.status(200).json(order);
    if (String(order.userId) === userId) return res.status(200).json(order);

    if (role === 'seller') {
      const ownsProduct = order.items.some(
        (item) => String(item.store) === storeId
      );
      if (ownsProduct) return res.status(200).json(order);
    }

    return res.status(403).json({ message: 'Bạn không có quyền xem đơn này' });
  } catch (err) {
    console.error('Lỗi lấy đơn hàng:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái đơn hàng khi nhận callback từ Momo
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, resultCode, amount, message, transId, payType } = req.body; // Lấy thông tin từ Momo

    // Kiểm tra nếu thiếu thông tin
    if (!orderId || typeof resultCode === 'undefined') {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }

    // Tìm đơn hàng trong cơ sở dữ liệu
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Cập nhật thông tin giao dịch Momo vào đơn hàng
    order.momoTransactionId = transId;
    order.momoPayType = payType;
    order.momoResultCode = resultCode;
    order.momoMessage = message;
    order.momoAmount = amount;
    order.momoCreatedAt = new Date();  // Hoặc có thể lấy từ tham số trong callback nếu Momo trả về

    // Cập nhật trạng thái đơn hàng
    if (resultCode === '0') {
      order.status = 'Đã thanh toán';  // Nếu thanh toán thành công
    } else {
      order.status = 'Thanh toán thất bại';  // Nếu thanh toán thất bại
    }

    // Lưu thay đổi
    await order.save();

    return res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });

  } catch (err) {
    console.error('Lỗi khi cập nhật trạng thái:', err);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};
const Store = require('../models/Store');
const mongoose = require('mongoose');

const getMySales = async (req, res) => {
  try {
    // Tìm store của seller đang đăng nhập
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ message: 'Bạn chưa có gian hàng' });

    const storeId = new mongoose.Types.ObjectId(store._id);

    const result = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.store': storeId } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] }
          },
          totalProductsSold: { $sum: '$items.quantity' },
          totalOrdersSet: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalProductsSold: 1,
          totalOrders: { $size: '$totalOrdersSet' }
        }
      }
    ]);

    const stats = result[0] || {
      totalRevenue: 0,
      totalProductsSold: 0,
      totalOrders: 0
    };

    res.json(stats);
  } catch (err) {
    console.error('Lỗi thống kê doanh thu:', err);
    res.status(500).json({ message: 'Không thể lấy doanh thu' });
  }
};




module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getMySales
};
