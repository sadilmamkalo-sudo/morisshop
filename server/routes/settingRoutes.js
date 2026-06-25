const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');

const defaults = {
  siteName: 'MORISSESHOP',
  siteDescription: 'Premium E-commerce Marocain',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '+212600000000',
  currency: 'MAD',
  freeShippingThreshold: 500,
  defaultShippingRate: 25,
  themeColor: '#f59e0b',
  logo: '',
  favicon: '',
  metaDescription: 'MORISSESHOP - Premium E-commerce Marocain',
  metaKeywords: 'morisshop, e-commerce, morocco, shopping',
  footerText: '© 2024 MORISSESHOP. All rights reserved.',
  address: '',
  phone: '',
  email: 'contact@morisshop.com',
  facebook: '',
  instagram: '',
  twitter: '',
  tiktok: ''
};

router.get('/', async (req, res) => {
  try {
    const settings = await Setting.find();
    const result = { ...defaults };
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', protect, adminOnly, hasPermission('manage_settings'), async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      if (key in defaults) {
        await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
      }
    }
    const settings = await Setting.find();
    const result = { ...defaults };
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
