const express = require('express');
const router = express.Router();
const GiftCard = require('../models/GiftCard');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');
const crypto = require('crypto');

router.post('/', protect, async (req, res) => {
  try {
    const { amount, recipientEmail, message, senderName } = req.body;
    if (amount < 50 || amount > 5000) return res.status(400).json({ message: 'Amount between 50 and 5000 DH' });
    const code = 'GIFT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const card = await GiftCard.create({ code, amount, balance: amount, senderName, recipientEmail, message, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const card = await GiftCard.findOne({ code: code.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
    if (!card) return res.status(400).json({ valid: false, message: 'Invalid or expired gift card' });
    if (card.balance <= 0) return res.status(400).json({ valid: false, message: 'Gift card balance depleted' });
    res.json({ valid: true, balance: card.balance, code: card.code });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, hasPermission('manage_coupons'), async (req, res) => {
  try {
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
