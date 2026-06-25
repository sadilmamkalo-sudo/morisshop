const express = require('express');
const router = express.Router();
const Comparison = require('../models/Comparison');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    let comparison = await Comparison.findOne({ user: req.user._id });
    if (!comparison) {
      comparison = await Comparison.create({ user: req.user._id, products: [] });
    }
    if (comparison.products.includes(req.params.productId)) {
      return res.status(400).json({ message: 'Product already in comparison' });
    }
    comparison.products.push(req.params.productId);
    await comparison.save();
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:productId', protect, async (req, res) => {
  try {
    const comparison = await Comparison.findOne({ user: req.user._id });
    if (!comparison) return res.status(404).json({ message: 'No comparison list found' });
    comparison.products = comparison.products.filter(id => id.toString() !== req.params.productId);
    await comparison.save();
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const comparison = await Comparison.findOne({ user: req.user._id }).populate('products');
    if (!comparison) return res.json({ products: [] });
    res.json(comparison);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/compare', async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',') : [];
    if (!ids.length) return res.status(400).json({ message: 'No product IDs provided' });
    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
