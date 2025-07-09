const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại.' });
    }

    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Bạn chưa mua đơn hàng này.' });
    }

    const hasProduct = order.items.some(
      (item) => String(item.productId) === productId
    );

    if (!hasProduct) {
      return res.status(400).json({ message: 'Sản phẩm không thuộc đơn hàng này.' });
    }

    // ✅ Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
      orderId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này.' });
    }

    const newReview = new Review({
      product: productId,
      user: userId,
      rating,
      comment,
      orderId,
    });

    await newReview.save();

    // ✅ Tính rating trung bình và cập nhật
    const allReviews = await Review.find({ product: productId });
    const avgRating = (
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    ).toFixed(1);

    await Product.findByIdAndUpdate(productId, { rating: avgRating });

    res.status(201).json({ message: 'Đánh giá thành công!' });
  } catch (err) {
    console.error('❌ Lỗi đánh giá:', err);
    res.status(500).json({ message: 'Lỗi khi gửi đánh giá' });
  }
};
