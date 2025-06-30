const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create_momo', authMiddleware, async (req, res) => {
  try {
    const partnerCode = 'MOMO';
    const accessKey = 'F8BBA842ECF85';
    const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const redirectUrl = 'http://localhost:3000/payment-success';
    const ipnUrl = 'https://webhook.site/abcxyz'; // Test callback
    const requestType = 'payWithMethod';
    const orderInfo = 'Thanh toan MERN voi Momo';
    const { totalAmount } = req.body;

    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const extraData = '';
    const autoCapture = true;
    const lang = 'vi';

    const rawSignature = `accessKey=${accessKey}&amount=${totalAmount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto.createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      partnerName: 'Momo Test',
      storeId: 'MomoTestStore',
      requestId,
      amount: totalAmount.toString(),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      signature
    };

    const momoRes = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);

    res.json({ payUrl: momoRes.data.payUrl });
  } catch (err) {
    console.error('Lỗi tạo thanh toán Momo:', err.response?.data || err.message);
    res.status(500).json({ message: 'Không thể tạo thanh toán Momo' });
  }
});

module.exports = router;
