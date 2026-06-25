const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/email');
const { protect } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ name, email, password, phone, verificationToken });
    await sendEmail({
      to: email,
      subject: 'Verify your email - MORISSESHOP',
      html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px"><h1 style="color:#f59e0b">MORISSESHOP</h1><p>Welcome ${name},</p><p>Please verify your email by clicking the link below:</p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${verificationToken}" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Verify Email</a><p>If you did not create an account, ignore this email.</p></div>`
    });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      phone: user.phone, isVerified: user.isVerified, token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendEmail({
      to: email,
      subject: 'Password Reset - MORISSESHOP',
      html: `<div style="font-family:Arial;max-width:600px;margin:auto;padding:20px"><h1 style="color:#f59e0b">MORISSESHOP</h1><p>You requested a password reset.</p><p>Click the link below to reset your password (expires in 1 hour):</p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px">Reset Password</a><p>If you did not request this, ignore this email.</p></div>`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });
    user.lastLogin = new Date();
    await user.save();
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      phone: user.phone, avatar: user.avatar, address: user.address,
      wishlist: user.wishlist, lang: user.lang, theme: user.theme,
      isVerified: user.isVerified,
      permissions: user.permissions, token: generateToken(user._id),
      warning: !user.isVerified ? 'Please verify your email address' : undefined
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, lang, theme } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (lang) user.lang = lang;
    if (theme) user.theme = theme;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
