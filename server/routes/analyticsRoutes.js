const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const applyDateFilter = (query, period) => {
  if (period === 'today') {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    query.createdAt = { $gte: start };
  } else if (period === 'week') {
    const start = new Date(); start.setDate(start.getDate() - 7);
    query.createdAt = { $gte: start };
  } else if (period === 'month') {
    const start = new Date(); start.setMonth(start.getMonth() - 1);
    query.createdAt = { $gte: start };
  } else if (period === 'year') {
    const start = new Date(); start.setFullYear(start.getFullYear() - 1);
    query.createdAt = { $gte: start };
  }
};

router.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const prevPeriod = new Date();
    if (req.query.period === 'month') { prevPeriod.setMonth(prevPeriod.getMonth() - 2); now.setMonth(now.getMonth() - 1); }
    else if (req.query.period === 'week') { prevPeriod.setDate(prevPeriod.getDate() - 14); now.setDate(now.getDate() - 7); }
    else { prevPeriod.setMonth(prevPeriod.getMonth() - 2); now.setMonth(now.getMonth() - 1); }

    const currentStart = new Date(prevPeriod.getTime() + (now.getTime() - prevPeriod.getTime()));
    const currentQuery = { createdAt: { $gte: currentStart } };
    const prevQuery = { createdAt: { $gte: prevPeriod, $lt: currentStart } };

    const [currentOrders, prevOrders, totalUsers, totalProducts] = await Promise.all([
      Order.find(currentQuery),
      Order.find(prevQuery),
      User.countDocuments(),
      Product.countDocuments()
    ]);

    const currentRevenue = currentOrders.reduce((s, o) => s + o.totalPrice, 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + o.totalPrice, 0);
    const currentOrderCount = currentOrders.length;
    const prevOrderCount = prevOrders.length;
    const currentNewUsers = await User.countDocuments(currentQuery);
    const prevNewUsers = await User.countDocuments(prevQuery);

    const calcChange = (curr, prev) => prev ? Math.round(((curr - prev) / prev) * 100 * 100) / 100 : (curr ? 100 : 0);

    res.json({
      revenue: { value: currentRevenue, change: calcChange(currentRevenue, prevRevenue) },
      orders: { value: currentOrderCount, change: calcChange(currentOrderCount, prevOrderCount) },
      users: { value: totalUsers, change: calcChange(currentNewUsers, prevNewUsers) },
      products: { value: totalProducts, change: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/daily', protect, adminOnly, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const start = new Date(); start.setDate(start.getDate() - days);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/monthly', protect, adminOnly, async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const start = new Date(); start.setMonth(start.getMonth() - months);
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, sales: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/best-sellers', protect, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/top-customers', protect, adminOnly, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Order.aggregate([
      { $group: { _id: '$user', orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { _id: '$user._id', name: '$user.name', email: '$user.email', orderCount: 1, totalSpent: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/revenue-by-category', protect, adminOnly, async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ['$product.category', 'Uncategorized'] }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
