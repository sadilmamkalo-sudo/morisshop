const express = require('express');
const router = express.Router();
const StaticPage = require('../models/StaticPage');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (!req.query.all) query.published = true;
    const pages = await StaticPage.find(query).sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const page = await StaticPage.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    if (!page.published && (!req.user || req.user.role === 'client')) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { slug, title, content, published } = req.body;
    const existing = await StaticPage.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Slug already exists' });
    const page = await StaticPage.create({ slug, title, content, published });
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const page = await StaticPage.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    const { slug, title, content, published } = req.body;
    if (slug) page.slug = slug;
    if (title) page.title = title;
    if (content) page.content = content;
    if (published !== undefined) page.published = published;
    await page.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const page = await StaticPage.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
