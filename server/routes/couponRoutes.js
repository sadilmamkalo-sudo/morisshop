const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');

router.get('/', protect, adminOnly, hasPermission('manage_coupons'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, hasPermission('manage_coupons'), async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
    const coupon = await Coupon.create({ code: code.toUpperCase(), type, value, minOrder, maxUses, expiresAt });
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, hasPermission('manage_coupons'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, hasPermission('manage_coupons'), async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
    if (!coupon) return res.status(400).json({ valid: false, message: 'Invalid or expired coupon' });
    if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ valid: false, message: 'Coupon exhausted' });
    if (orderTotal < coupon.minOrder) return res.status(400).json({ valid: false, message: `Minimum order: ${coupon.minOrder} DH` });
    res.json({ valid: true, coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
