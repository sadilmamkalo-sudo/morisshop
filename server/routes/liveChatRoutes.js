const express = require('express');
const router = express.Router();
const LiveChat = require('../models/LiveChat');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    let chat = await LiveChat.findOne({ user: req.user._id, status: 'open' });
    if (!chat) {
      chat = await LiveChat.create({ user: req.user._id });
    }
    if (req.body.message) {
      chat.messages.push({ sender: 'user', message: req.body.message });
      await chat.save();
    }
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/message', protect, async (req, res) => {
  try {
    const chat = await LiveChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.user.toString() !== req.user._id.toString() && req.user.role === 'client') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const sender = req.user.role !== 'client' ? 'admin' : 'user';
    if (sender === 'admin') chat.admin = req.user._id;
    chat.messages.push({ sender, message: req.body.message });
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const chats = await LiveChat.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const chats = await LiveChat.find(query).populate('user', 'name email phone').sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/close', protect, async (req, res) => {
  try {
    const chat = await LiveChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.user.toString() !== req.user._id.toString() && req.user.role === 'client') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    chat.status = 'closed';
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
