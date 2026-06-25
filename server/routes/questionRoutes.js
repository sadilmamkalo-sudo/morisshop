const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { productId, question } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const q = await Question.create({ product: productId, user: req.user._id, question });
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const query = { product: req.params.productId, isPublished: true };
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user) {
          query.$or = [{ isPublished: true }, { user: user._id }];
          delete query.isPublished;
        }
      } catch (e) {}
    }
    const questions = await Question.find(query).populate('user', 'name').sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const questions = await Question.find().populate('user', 'name email').populate('product', 'name').sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/answer', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    question.answer = req.body.answer;
    question.answeredBy = req.user._id;
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/publish', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    question.isPublished = !question.isPublished;
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
