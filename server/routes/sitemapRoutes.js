const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).select('slug updatedAt').lean();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const pages = [
      { loc: '/', priority: 1.0 }, { loc: '/shop', priority: 0.9 },
      { loc: '/cart', priority: 0.4 }, { loc: '/login', priority: 0.4 },
      { loc: '/register', priority: 0.4 }
    ];
    let xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    pages.forEach(p => { xml += `<url><loc>${baseUrl}${p.loc}</loc><priority>${p.priority}</priority></url>`; });
    products.forEach(p => { xml += `<url><loc>${baseUrl}/product/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><priority>0.8</priority></url>`; });
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/robots.txt', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/api/sitemap/sitemap.xml`);
});

module.exports = { sitemapRoutes: router };
