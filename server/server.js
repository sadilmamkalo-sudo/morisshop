const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');

const path = require('path');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const returnRoutes = require('./routes/returnRoutes');
const giftCardRoutes = require('./routes/giftCardRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const exportRoutes = require('./routes/exportRoutes');
const { sitemapRoutes } = require('./routes/sitemapRoutes');
const questionRoutes = require('./routes/questionRoutes');
const blogRoutes = require('./routes/blogRoutes');
const staticPageRoutes = require('./routes/staticPageRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const liveChatRoutes = require('./routes/liveChatRoutes');
const comparisonRoutes = require('./routes/comparisonRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const backupRoutes = require('./routes/backupRoutes');
const smsRoutes = require('./routes/smsRoutes');
const settingRoutes = require('./routes/settingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL] : ['http://localhost:5173', 'http://localhost:3000'], credentials: true } });

io.on('connection', (socket) => {
  socket.on('join', (userId) => { if (userId) socket.join(`user_${userId}`); });
  socket.on('disconnect', () => {});
});

global.io = io;

connectDB().then(async () => {
  const User = require('./models/User');
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existing) {
    await User.create({
      name: 'Super Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'superadmin',
      permissions: ['manage_products', 'manage_orders', 'manage_users', 'manage_admins', 'manage_coupons', 'manage_tickets', 'view_reports', 'manage_settings']
    });
    console.log('Super admin created from .env credentials');
  }
  const Setting = require('./models/Setting');
  const seedSettings = {
    whatsappNumber: '+212728755639',
    instagram: process.env.INSTAGRAM_URL || 'https://www.instagram.com/adam.strikes?igsh=MXE2anRjNXAzZzFsMQ==',
    email: process.env.CONTACT_EMAIL || 'sadilmamkalo@gmail.com',
    siteName: process.env.SITE_NAME || 'MORISSESHOP'
  };
  for (const [key, value] of Object.entries(seedSettings)) {
    const exists = await Setting.findOne({ key });
    if (!exists) await Setting.create({ key, value });
  }
  console.log('Settings seeded');

  const Product = require('./models/Product');
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const demoProducts = [
      { name: { ar: 'هاتف ذكي Pro Max', fr: 'Smartphone Pro Max', en: 'Smartphone Pro Max' }, description: { ar: 'أحدث هاتف ذكي بأداء عالي', fr: 'Dernier smartphone haute performance', en: 'Latest high-performance smartphone' }, price: 8999, oldPrice: 10999, category: 'Électronique', stock: 50, images: ['https://picsum.photos/seed/phone1/400/400'], isFeatured: true, tags: ['phone', 'smartphone', 'tech'], averageRating: 4.5 },
      { name: { ar: 'حاسوب محمول Ultra', fr: 'Laptop Ultra', en: 'Ultra Laptop' }, description: { ar: 'حاسوب محمول خفيف وقوي', fr: 'Ordinateur portable léger et puissant', en: 'Lightweight powerful laptop' }, price: 12999, oldPrice: 15999, category: 'Électronique', stock: 30, images: ['https://picsum.photos/seed/laptop1/400/400'], isFeatured: true, tags: ['laptop', 'computer', 'tech'], averageRating: 4.7 },
      { name: { ar: 'سماعات لاسلكية', fr: 'Écouteurs Sans Fil', en: 'Wireless Headphones' }, description: { ar: 'سماعات بلوتوث عالية الجودة', fr: 'Casque Bluetooth haute qualité', en: 'High-quality Bluetooth headphones' }, price: 599, oldPrice: 899, category: 'Électronique', stock: 100, images: ['https://picsum.photos/seed/headphones1/400/400'], tags: ['audio', 'headphones', 'wireless'], averageRating: 4.2 },
      { name: { ar: 'ساعة ذكية', fr: 'Montre Connectée', en: 'Smart Watch' }, description: { ar: 'ساعة ذكية متعددة الوظائف', fr: 'Montre connectée multifonction', en: 'Multi-function smart watch' }, price: 2499, oldPrice: 3299, category: 'Électronique', stock: 40, images: ['https://picsum.photos/seed/watch1/400/400'], isFeatured: true, tags: ['watch', 'wearable', 'tech'], averageRating: 4.3 },
      { name: { ar: 'قميص كلاسيكي', fr: 'Chemise Classique', en: 'Classic Shirt' }, description: { ar: 'قميص قطني مريح وأنيق', fr: 'Chemise en coton confortable et élégante', en: 'Comfortable elegant cotton shirt' }, price: 349, oldPrice: 499, category: 'Mode', stock: 200, images: ['https://picsum.photos/seed/shirt1/400/400'], tags: ['shirt', 'clothing', 'classic'], averageRating: 4.0 },
      { name: { ar: 'فستان صيفي', fr: 'Robe d\'Été', en: 'Summer Dress' }, description: { ar: 'فستان صيفي خفيف وجميل', fr: 'Robe d\'été légère et belle', en: 'Light beautiful summer dress' }, price: 599, oldPrice: 799, category: 'Mode', stock: 150, images: ['https://picsum.photos/seed/dress1/400/400'], tags: ['dress', 'summer', 'women'], averageRating: 4.4 },
      { name: { ar: 'حذاء رياضي', fr: 'Chaussures de Sport', en: 'Sports Shoes' }, description: { ar: 'حذاء رياضي مريح للمشي والجري', fr: 'Chaussures de sport confortables', en: 'Comfortable running shoes' }, price: 899, oldPrice: 1299, category: 'Sport', stock: 80, images: ['https://picsum.photos/seed/shoes1/400/400'], isFeatured: true, tags: ['shoes', 'sports', 'running'], averageRating: 4.6 },
      { name: { ar: 'طقم كؤوس زجاجية', fr: 'Verres en Verre', en: 'Glass Cups Set' }, description: { ar: 'طقم 6 كؤوس زجاجية فاخرة', fr: 'Set de 6 verres en verre de luxe', en: 'Set of 6 luxury glass cups' }, price: 249, oldPrice: 399, category: 'Maison', stock: 60, images: ['https://picsum.photos/seed/glasses1/400/400'], tags: ['glass', 'kitchen', 'home'], averageRating: 4.1 },
    ];
    for (const p of demoProducts) await Product.create(p);
    console.log(`Seeded ${demoProducts.length} demo products`);
  } else {
    console.log(`Found ${productCount} existing products`);
  }

  const Coupon = require('./models/Coupon');
  const couponExists = await Coupon.findOne({ code: 'WELCOME20' });
  if (!couponExists) {
    await Coupon.create({ code: 'WELCOME20', value: 20, type: 'percentage', minOrder: 500, maxUses: 100, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true });
    console.log('Coupon WELCOME20 created');
  }
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'] : ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { message: 'Too many requests, please try again later' }
});
app.use('/api/auth/login', rateLimit({ windowMs: 60 * 1000, max: 20 }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 1000, max: 10 }));
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/sitemap', sitemapRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/pages', staticPageRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/live-chat', liveChatRoutes);
app.use('/api/comparisons', comparisonRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/settings', settingRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/config', async (req, res) => {
  try {
    const Setting = require('./models/Setting');
    const settings = await Setting.find();
    const result = {
      whatsappNumber: process.env.WHATSAPP_NUMBER || '+212728755639',
      siteName: 'MORISSESHOP',
      currency: 'MAD',
      freeShippingThreshold: 500,
      defaultShippingRate: 25,
      logo: '',
      favicon: '',
      siteDescription: 'Premium E-commerce Marocain',
      email: 'contact@morisshop.com',
      phone: '',
      address: '',
      footerText: '© All rights reserved.',
      metaDescription: 'MORISSESHOP - Premium E-commerce Marocain',
      metaKeywords: 'morisshop, e-commerce, morocco, shopping',
      facebook: '',
      instagram: '',
      twitter: '',
      tiktok: ''
    };
    settings.forEach(s => { if (s.key in result) result[s.key] = s.value; });
    res.json(result);
  } catch {
    res.json({ whatsappNumber: process.env.WHATSAPP_NUMBER, siteName: 'MORISSESHOP' });
  }
});

app.get('/api/orders/:id/invoice', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const User = require('./models/User');
    const { generateInvoice } = require('./utils/invoice');
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const user = await User.findById(order.user);
    const pdf = await generateInvoice(order, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id.slice(-8)}.pdf`);
    res.send(pdf);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production' && require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
