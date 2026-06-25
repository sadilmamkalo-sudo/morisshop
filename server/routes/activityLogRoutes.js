const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await ActivityLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await ActivityLog.countDocuments();
    res.json({ logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const stats = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const logActivity = async ({ user, action, resource, resourceId, details, ip, userAgent }) => {
  try {
    await ActivityLog.create({ user, action, resource, resourceId, details, ip, userAgent });
  } catch (err) {
    console.error('Log error:', err.message);
  }
};

module.exports.logActivity = logActivity;
