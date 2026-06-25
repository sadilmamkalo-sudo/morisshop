const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const GiftCard = require('../models/GiftCard');
const User = require('../models/User');
const { orderStatusEmail } = require('../utils/email');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');
const { addPoints } = require('./loyaltyRoutes');
const { createNotification } = require('./notificationRoutes');
const { logActivity } = require('./activityLogRoutes');

router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, giftCardCode, useLoyaltyPoints } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items' });

    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isAvailable) {
        return res.status(400).json({ message: `${product ? product.name.en : 'Product'} not available` });
      }
      itemsPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || ''
      });
    }

    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
      if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });
      if (coupon.usedCount >= coupon.maxUses) return res.status(400).json({ message: 'Coupon exhausted' });
      if (itemsPrice < coupon.minOrder) return res.status(400).json({ message: `Minimum order: ${coupon.minOrder}` });
      discountAmount += coupon.type === 'percentage' ? (itemsPrice * coupon.value) / 100 : coupon.value;
      coupon.usedCount += 1;
      await coupon.save();
    }

    if (giftCardCode) {
      const card = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), isActive: true, expiresAt: { $gt: new Date() } });
      if (!card) return res.status(400).json({ message: 'Invalid gift card' });
      const applyAmount = Math.min(card.balance, itemsPrice - discountAmount);
      discountAmount += applyAmount;
      card.balance -= applyAmount;
      if (card.balance <= 0) card.isActive = false;
      card.usedBy = req.user._id;
      card.usedAt = new Date();
      await card.save();
    }

    let loyaltyDiscount = 0;
    if (useLoyaltyPoints && req.user) {
      const { redeemPoints } = require('./loyaltyRoutes');
      loyaltyDiscount = await redeemPoints(req.user._id, useLoyaltyPoints) || 0;
      discountAmount += loyaltyDiscount;
    }

    const totalPrice = Math.max(0, itemsPrice - discountAmount);

    const order = await Order.create({
      user: req.user._id, items: orderItems, shippingAddress, paymentMethod,
      itemsPrice, discountAmount, couponCode: couponCode || '', totalPrice,
      trackingHistory: [{ status: 'pending', note: 'Order placed', updatedAt: new Date() }]
    });

    if (addPoints) await addPoints(req.user._id, totalPrice);
    if (createNotification) createNotification({ user: req.user._id, type: 'order', title: 'Order Placed', message: `Order #${order._id.toString().slice(-8)} placed successfully`, link: `/orders/${order._id}` });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'client') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', protect, adminOnly, hasPermission('manage_orders'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    order.trackingHistory.push({ status, note: note || `Status updated to ${status}`, updatedAt: new Date() });
    if (status === 'delivered') { order.isPaid = true; order.paidAt = new Date(); order.deliveredAt = new Date(); }
    if (status === 'cancelled') { await addPoints(order.user, -order.totalPrice * 0.5); }
    await order.save();
    const user = await User.findById(order.user);
    if (user) orderStatusEmail(order, user);
    if (createNotification) createNotification({ user: order.user, type: 'order', title: 'Order Updated', message: `Order #${order._id.toString().slice(-8)} is now ${status}`, link: `/orders/${order._id}` });
    if (logActivity) logActivity({ user: req.user._id, action: `order_${status}`, resource: 'Order', resourceId: order._id });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, hasPermission('manage_orders'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).populate('user', 'name email phone')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
