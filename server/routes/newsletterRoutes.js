const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendEmail } = require('../utils/email');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Already subscribed' });
    await NewsletterSubscriber.create({ email });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/send', protect, adminOnly, async (req, res) => {
  try {
    const { subject, content } = req.body;
    const subscribers = await NewsletterSubscriber.find();
    const emails = subscribers.map(s => s.email);
    const campaign = await Newsletter.create({ subject, content, recipients: emails, totalSent: emails.length });
    for (const email of emails) {
      await sendEmail({ to: email, subject, html: content });
    }
    campaign.sentAt = new Date();
    await campaign.save();
    res.status(201).json({ message: 'Campaign sent', campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const campaigns = await Newsletter.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/subscribers', protect, adminOnly, async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
