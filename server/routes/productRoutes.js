const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, search, featured, minPrice, maxPrice, page = 1, limit = 12, sort } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }
    if (featured === 'true') query.isFeatured = true;
    if (featured === 'available') query.isAvailable = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating') sortObj = { averageRating: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortObj).skip((page - 1) * limit).limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, hasPermission('manage_products'), async (req, res) => {
  try {
    const { name, description, price, oldPrice, discount, category, images, stock, isFeatured, tags, variants } = req.body;
    const slug = name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await Product.create({
      name, description, price, oldPrice, discount, category, images, stock, isFeatured, tags, slug, variants
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, hasPermission('manage_products'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, hasPermission('manage_products'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const alreadyReviewed = product.ratings.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });
    product.ratings.push({ user: req.user._id, name: req.user.name, rating, comment });
    await product.save();
    res.json({ message: 'Review added', product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
