const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ShippingRate = require('../models/ShippingRate');

const rates = [
  { city: 'Casablanca', region: 'Casablanca-Settat', rate: 25, freeShippingMin: 500, estimatedDays: '2-3 days' },
  { city: 'Rabat', region: 'Rabat-Salé-Kénitra', rate: 25, freeShippingMin: 500, estimatedDays: '2-3 days' },
  { city: 'Marrakech', region: 'Marrakech-Safi', rate: 30, freeShippingMin: 500, estimatedDays: '2-3 days' },
  { city: 'Fes', region: 'Fès-Meknès', rate: 30, freeShippingMin: 500, estimatedDays: '2-3 days' },
  { city: 'Tangier', region: 'Tanger-Tétouan-Al Hoceïma', rate: 35, freeShippingMin: 500, estimatedDays: '2-3 days' },
  { city: 'Agadir', region: 'Souss-Massa', rate: 35, freeShippingMin: 500, estimatedDays: '2-3 days' },
  { city: 'Oujda', region: 'Oriental', rate: 40, freeShippingMin: 500, estimatedDays: '3-4 days' },
  { city: 'Laayoune', region: 'Laâyoune-Sakia El Hamra', rate: 50, freeShippingMin: 500, estimatedDays: '4-5 days' },
  { city: 'Dakhla', region: 'Dakhla-Oued Ed-Dahab', rate: 55, freeShippingMin: 500, estimatedDays: '5-6 days' },
  { city: 'Other', region: 'Other', rate: 35, freeShippingMin: 500, estimatedDays: '3-4 days' }
];

const seed = async () => {
  await connectDB();
  const count = await ShippingRate.countDocuments();
  if (count === 0) {
    await ShippingRate.insertMany(rates);
    console.log(`${rates.length} shipping rates seeded`);
  } else {
    console.log(`${count} shipping rates already exist`);
  }
  process.exit(0);
};

seed();
