const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema({
  city: { type: String, required: true },
  region: { type: String, default: '' },
  rate: { type: Number, required: true },
  freeShippingMin: { type: Number, default: 500 },
  estimatedDays: { type: String, default: '3-4 days' }
}, { timestamps: true });

module.exports = mongoose.model('ShippingRate', shippingRateSchema);
