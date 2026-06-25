const express = require('express');
const router = express.Router();
const ShippingRate = require('../models/ShippingRate');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const rates = await ShippingRate.find().sort({ city: 1 });
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { city, region, rate, freeShippingMin, estimatedDays } = req.body;
    const shipping = await ShippingRate.create({ city, region, rate, freeShippingMin, estimatedDays });
    res.status(201).json(shipping);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const shipping = await ShippingRate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shipping) return res.status(404).json({ message: 'Rate not found' });
    res.json(shipping);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const shipping = await ShippingRate.findByIdAndDelete(req.params.id);
    if (!shipping) return res.status(404).json({ message: 'Rate not found' });
    res.json({ message: 'Rate deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/calculate', async (req, res) => {
  try {
    const { city, orderTotal } = req.body;
    let rate = await ShippingRate.findOne({ city: new RegExp(`^${city}$`, 'i') });
    if (!rate) rate = await ShippingRate.findOne({ city: 'Other' });
    if (!rate) return res.status(404).json({ message: 'Shipping not available for this city' });
    const isFree = orderTotal && rate.freeShippingMin && orderTotal >= rate.freeShippingMin;
    res.json({
      city: rate.city,
      rate: isFree ? 0 : rate.rate,
      originalRate: rate.rate,
      isFree: !!isFree,
      freeShippingMin: rate.freeShippingMin,
      estimatedDays: rate.estimatedDays
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
