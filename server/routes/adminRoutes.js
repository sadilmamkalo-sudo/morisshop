const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly, superAdminOnly, hasPermission } = require('../middleware/auth');

router.get('/users', protect, adminOnly, hasPermission('manage_users'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/users/:id/toggle', protect, adminOnly, hasPermission('manage_users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'superadmin') return res.status(403).json({ message: 'Cannot modify superadmin' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admins', protect, adminOnly, hasPermission('manage_admins'), async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/admins', protect, superAdminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, permissions } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const admin = await User.create({ name, email, password, phone, role: 'admin', permissions });
    res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/admins/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const { name, email, phone, permissions, isActive } = req.body;
    const admin = await User.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (admin.role === 'superadmin') return res.status(403).json({ message: 'Cannot modify superadmin' });
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (permissions) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;
    await admin.save();
    res.json({ message: 'Admin updated', admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/admins/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    if (admin.role === 'superadmin') return res.status(403).json({ message: 'Cannot delete superadmin' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', protect, adminOnly, hasPermission('view_reports'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'client' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({
      totalUsers, totalProducts, totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
