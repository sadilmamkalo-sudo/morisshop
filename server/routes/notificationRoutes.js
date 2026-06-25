const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id, isAdmin: req.user.role !== 'client' ? { $in: [false, true] } : false }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createNotification = async ({ user, type, title, message, link, isAdmin = false }) => {
  try {
    const notif = await Notification.create({ user, type, title, message, link, isAdmin });
    if (global.io) global.io.to(`user_${user}`).emit('notification', notif);
    return notif;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

module.exports = router;
module.exports.createNotification = createNotification;
