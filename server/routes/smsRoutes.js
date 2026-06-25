const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/send', protect, adminOnly, async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) return res.status(400).json({ message: 'Phone and message required' });
    console.log(`[SMS SIMULATED] To: ${to}, Message: ${message}`);
    res.json({ message: 'SMS sent successfully (simulated)' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/order-status/:orderId', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const user = order.user;
    const phone = user.phone;
    if (!phone) return res.status(400).json({ message: 'User has no phone number' });
    const message = `MORISSESHOP: Your order #${order._id.slice(-8)} status: ${order.status}. Total: ${order.totalPrice} DH. Thank you!`;
    console.log(`[SMS SIMULATED] To: ${phone}, Message: ${message}`);
    res.json({ message: 'Order status SMS sent (simulated)', to: phone, orderStatus: order.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
