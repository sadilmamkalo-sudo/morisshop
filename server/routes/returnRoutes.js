const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { orderId, items, reason } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (order.status !== 'delivered') return res.status(400).json({ message: 'Order not yet delivered' });
    const existing = await Return.findOne({ order: orderId, user: req.user._id, status: { $in: ['pending', 'approved'] } });
    if (existing) return res.status(400).json({ message: 'Return already requested' });
    const ret = await Return.create({ order: orderId, user: req.user._id, items, reason });
    res.status(201).json(ret);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user._id }).populate('order', 'totalPrice status').sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, hasPermission('manage_orders'), async (req, res) => {
  try {
    const returns = await Return.find().populate('user', 'name email').populate('order', 'totalPrice').sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, hasPermission('manage_orders'), async (req, res) => {
  try {
    const { status, refundAmount, adminNote } = req.body;
    const ret = await Return.findByIdAndUpdate(req.params.id, { status, refundAmount, adminNote }, { new: true });
    if (!ret) return res.status(404).json({ message: 'Return not found' });
    res.json(ret);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
