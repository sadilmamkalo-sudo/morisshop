const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const dbPath = path.join(__dirname, '..', '.mongodb-data');
  if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });
  const mongod = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
  const uri = mongod.getUri() + 'morisshop';
  await mongoose.connect(uri);
  console.log('Connected to persistent DB');
  return { mongod, uri };
};

const seed = async () => {
  const { mongod } = await connectDB();

  const Product = require('./models/Product');
  const Coupon = require('./models/Coupon');

  const existing = await Product.countDocuments();
  if (existing > 0) { console.log(`Already have ${existing} products, skipping seed`); await mongoose.disconnect(); await mongod.stop(); return; }

  const products = [
    { name: { ar: 'هاتف ذكي Pro Max', fr: 'Smartphone Pro Max', en: 'Smartphone Pro Max' }, description: { ar: 'أحدث هاتف ذكي بأداء عالي', fr: 'Dernier smartphone haute performance', en: 'Latest high-performance smartphone' }, price: 8999, oldPrice: 10999, category: 'Électronique', stock: 50, images: ['https://picsum.photos/seed/phone1/400/400'], isFeatured: true, tags: ['phone', 'smartphone', 'tech'], averageRating: 4.5 },
    { name: { ar: 'حاسوب محمول Ultra', fr: 'Laptop Ultra', en: 'Ultra Laptop' }, description: { ar: 'حاسوب محمول خفيف وقوي', fr: 'Ordinateur portable léger et puissant', en: 'Lightweight powerful laptop' }, price: 12999, oldPrice: 15999, category: 'Électronique', stock: 30, images: ['https://picsum.photos/seed/laptop1/400/400'], isFeatured: true, tags: ['laptop', 'computer', 'tech'], averageRating: 4.7 },
    { name: { ar: 'سماعات لاسلكية', fr: 'Écouteurs Sans Fil', en: 'Wireless Headphones' }, description: { ar: 'سماعات بلوتوث عالية الجودة', fr: 'Casque Bluetooth haute qualité', en: 'High-quality Bluetooth headphones' }, price: 599, oldPrice: 899, category: 'Électronique', stock: 100, images: ['https://picsum.photos/seed/headphones1/400/400'], tags: ['audio', 'headphones', 'wireless'], averageRating: 4.2 },
    { name: { ar: 'ساعة ذكية', fr: 'Montre Connectée', en: 'Smart Watch' }, description: { ar: 'ساعة ذكية متعددة الوظائف', fr: 'Montre connectée multifonction', en: 'Multi-function smart watch' }, price: 2499, oldPrice: 3299, category: 'Électronique', stock: 40, images: ['https://picsum.photos/seed/watch1/400/400'], isFeatured: true, tags: ['watch', 'wearable', 'tech'], averageRating: 4.3 },
    { name: { ar: 'قميص كلاسيكي', fr: 'Chemise Classique', en: 'Classic Shirt' }, description: { ar: 'قميص قطني مريح وأنيق', fr: 'Chemise en coton confortable et élégante', en: 'Comfortable elegant cotton shirt' }, price: 349, oldPrice: 499, category: 'Mode', stock: 200, images: ['https://picsum.photos/seed/shirt1/400/400'], tags: ['shirt', 'clothing', 'classic'], averageRating: 4.0 },
    { name: { ar: 'فستان صيفي', fr: 'Robe d\'Été', en: 'Summer Dress' }, description: { ar: 'فستان صيفي خفيف وجميل', fr: 'Robe d\'été légère et belle', en: 'Light beautiful summer dress' }, price: 599, oldPrice: 799, category: 'Mode', stock: 150, images: ['https://picsum.photos/seed/dress1/400/400'], tags: ['dress', 'summer', 'women'], averageRating: 4.4 },
    { name: { ar: 'حذاء رياضي', fr: 'Chaussures de Sport', en: 'Sports Shoes' }, description: { ar: 'حذاء رياضي مريح للمشي والجري', fr: 'Chaussures de sport confortables', en: 'Comfortable running shoes' }, price: 899, oldPrice: 1299, category: 'Sport', stock: 80, images: ['https://picsum.photos/seed/shoes1/400/400'], isFeatured: true, tags: ['shoes', 'sports', 'running'], averageRating: 4.6 },
    { name: { ar: 'طقم كؤوس زجاجية', fr: 'Verres en Verre', en: 'Glass Cups Set' }, description: { ar: 'طقم 6 كؤوس زجاجية فاخرة', fr: 'Set de 6 verres en verre de luxe', en: 'Set of 6 luxury glass cups' }, price: 249, oldPrice: 399, category: 'Maison', stock: 60, images: ['https://picsum.photos/seed/glasses1/400/400'], tags: ['glass', 'kitchen', 'home'], averageRating: 4.1 },
  ];

  for (const p of products) await Product.create(p);
  console.log(`Seeded ${products.length} products`);

  const couponExists = await Coupon.findOne({ code: 'WELCOME20' });
  if (!couponExists) {
    await Coupon.create({ code: 'WELCOME20', value: 20, type: 'percentage', minOrder: 500, maxUses: 100, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true });
    console.log('Coupon WELCOME20 created');
  }

  await mongoose.disconnect();
  await mongod.stop();
  console.log('Seed complete!');
};

seed().catch(e => { console.error(e); process.exit(1); });
