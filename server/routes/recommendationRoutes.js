const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: { $ne: 'cancelled' } }).populate('items.product');
    const purchasedProductIds = new Set();
    const categoryScores = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          purchasedProductIds.add(item.product._id.toString());
          const cat = item.product.category;
          categoryScores[cat] = (categoryScores[cat] || 0) + item.quantity;
        }
      });
    });
    const user = await (require('../models/User')).findById(req.user._id).populate('wishlist');
    if (user.wishlist) {
      user.wishlist.forEach(p => {
        if (p && p.category) {
          categoryScores[p.category] = (categoryScores[p.category] || 0) + 1;
        }
      });
    }
    const categories = Object.keys(categoryScores).sort((a, b) => categoryScores[b] - categoryScores[a]);
    if (!categories.length) {
      const featured = await Product.find({ isFeatured: true }).limit(8);
      return res.json(featured);
    }
    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: Array.from(purchasedProductIds) },
      isAvailable: true
    }).sort({ rating: -1, numReviews: -1 }).limit(10);
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
