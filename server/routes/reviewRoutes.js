const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name').sort({ createdAt: -1 });
    const stats = await Review.aggregate([
      { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 }, distribution: { $push: '$rating' } } }
    ]);
    const dist = [0, 0, 0, 0, 0];
    if (stats[0]) stats[0].distribution.forEach(r => { dist[r - 1]++ });
    res.json({ reviews, stats: stats[0] ? { avg: Math.round(stats[0].avg * 10) / 10, count: stats[0].count, distribution: dist } : { avg: 0, count: 0, distribution: [0, 0, 0, 0, 0] } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already reviewed this product' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const review = await Review.create({ product: productId, user: req.user._id, rating, title, comment, images });
    const all = await Review.find({ product: productId });
    product.rating = Math.round(all.reduce((s, r) => s + r.rating, 0) / all.length * 10) / 10;
    product.numReviews = all.length;
    await product.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    const { rating, title, comment, images } = req.body;
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    await review.save();
    const product = await Product.findById(review.product);
    const all = await Review.find({ product: review.product });
    product.rating = Math.round(all.reduce((s, r) => s + r.rating, 0) / all.length * 10) / 10;
    await product.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role === 'client') return res.status(403).json({ message: 'Not authorized' });
    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    const product = await Product.findById(productId);
    const all = await Review.find({ product: productId });
    product.rating = all.length ? Math.round(all.reduce((s, r) => s + r.rating, 0) / all.length * 10) / 10 : 0;
    product.numReviews = all.length;
    await product.save();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'name email').populate('product', 'name').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
