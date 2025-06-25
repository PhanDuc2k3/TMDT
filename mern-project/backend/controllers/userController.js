const User = require('../models/User');

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID từ token
    const { name, email } = req.body;

    if (!name || !email)
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true } // trả về document đã cập nhật
    );

    res.status(200).json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};


const getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' });
    res.json({ buyers });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
};

module.exports = {
  updateUser,
  getBuyers
};

