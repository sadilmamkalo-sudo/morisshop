const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const products = [
  {
    name: { ar: 'قميص كلاسيك', fr: 'Chemise Classique', en: 'Classic Shirt' },
    description: { ar: 'قميص أنيق مصنوع من القطن عالي الجودة', fr: 'Chemise élégante en coton de haute qualité', en: 'Elegant shirt made of high quality cotton' },
    price: 299, oldPrice: 399, discount: 25, category: 'ملابس', stock: 50,
    isFeatured: true, tags: ['shirt', 'classic', 'cotton']
  },
  {
    name: { ar: 'حذاء رياضي', fr: 'Chaussures de Sport', en: 'Sports Shoes' },
    description: { ar: 'حذاء رياضي مريح للمشي والجري', fr: 'Chaussures de sport confortables pour la marche et la course', en: 'Comfortable sports shoes for walking and running' },
    price: 549, oldPrice: 699, discount: 21, category: 'أحذية', stock: 30,
    isFeatured: true, tags: ['shoes', 'sports', 'running']
  },
  {
    name: { ar: 'ساعة يد فاخرة', fr: 'Montre de Luxe', en: 'Luxury Watch' },
    description: { ar: 'ساعة يد بتصميم فاخر مقاومة للماء', fr: 'Montre-bracelet de luxe étanche', en: 'Luxury water-resistant wristwatch' },
    price: 1299, oldPrice: 1599, discount: 18, category: 'إكسسوارات', stock: 15,
    isFeatured: true, tags: ['watch', 'luxury', 'accessory']
  },
  {
    name: { ar: 'حقيبة جلدية', fr: 'Sac en Cuir', en: 'Leather Bag' },
    description: { ar: 'حقيبة يد جلدية أصلية فاخرة', fr: 'Sac à main en cuir véritable de luxe', en: 'Genuine luxurious leather handbag' },
    price: 899, oldPrice: 1199, discount: 25, category: 'إكسسوارات', stock: 20,
    isFeatured: true, tags: ['bag', 'leather', 'luxury']
  },
  {
    name: { ar: 'هاتف ذكي', fr: 'Smartphone', en: 'Smartphone' },
    description: { ar: 'هاتف ذكي بشاشة 6.5 بوصة وكاميرا 48MP', fr: 'Smartphone écran 6.5" caméra 48MP', en: 'Smartphone with 6.5" display and 48MP camera' },
    price: 4499, oldPrice: 5299, discount: 15, category: 'إلكترونيات', stock: 25,
    isFeatured: true, tags: ['phone', 'smartphone', 'electronics']
  },
  {
    name: { ar: 'سماعات لاسلكية', fr: 'Casque Sans Fil', en: 'Wireless Headphones' },
    description: { ar: 'سماعات بلوتوث مع إلغاء الضوضاء', fr: 'Casque Bluetooth avec suppression du bruit', en: 'Bluetooth headphones with noise cancellation' },
    price: 699, oldPrice: 899, discount: 22, category: 'إلكترونيات', stock: 40,
    isFeatured: true, tags: ['headphones', 'wireless', 'bluetooth']
  },
  {
    name: { ar: 'نظارات شمسية', fr: 'Lunettes de Soleil', en: 'Sunglasses' },
    description: { ar: 'نظارات شمسية فاخرة مع حماية من الأشعة فوق البنفسجية', fr: 'Lunettes de soleil luxueuses avec protection UV', en: 'Luxury sunglasses with UV protection' },
    price: 399, oldPrice: 549, discount: 27, category: 'إكسسوارات', stock: 35,
    tags: ['sunglasses', 'uv', 'fashion']
  },
  {
    name: { ar: 'زي تقليدي مغربي', fr: 'Tenue Traditionnelle Marocaine', en: 'Moroccan Traditional Outfit' },
    description: { ar: 'زي تقليدي مغربي أصيل مناسب للمناسبات', fr: 'Tenue traditionnelle marocaine authentique pour occasions', en: 'Authentic Moroccan traditional outfit for occasions' },
    price: 799, oldPrice: 999, discount: 20, category: 'ملابس', stock: 10,
    isFeatured: true, tags: ['moroccan', 'traditional', 'caftan']
  },
  {
    name: { ar: 'زيت أركان عضوي', fr: 'Huile d\'Argan Bio', en: 'Organic Argan Oil' },
    description: { ar: 'زيت أركان مغربي 100% عضوي للبشرة والشعر', fr: 'Huile d\'argan marocaine 100% bio pour peau et cheveux', en: '100% organic Moroccan argan oil for skin and hair' },
    price: 199, oldPrice: 249, discount: 20, category: 'منتجات طبيعية', stock: 60,
    tags: ['argan', 'oil', 'organic', 'moroccan']
  },
  {
    name: { ar: 'مصباح زيت تقليدي', fr: 'Lampe à Huile Traditionnelle', en: 'Traditional Oil Lamp' },
    description: { ar: 'مصباح زيت مغربي تقليدي مطلي بالنحاس', fr: 'Lampe à huile marocaine traditionnelle en cuivre', en: 'Traditional Moroccan oil lamp in copper' },
    price: 449, oldPrice: 549, discount: 18, category: 'ديكور', stock: 15,
    tags: ['lamp', 'moroccan', 'decor', 'copper']
  },
  {
    name: { ar: 'طبق سيراميك مزخرف', fr: 'Plat en Céramique Décoré', en: 'Decorative Ceramic Plate' },
    description: { ar: 'طبق سيراميك مغربي مرسوم باليد', fr: 'Plat en céramique marocaine peint à la main', en: 'Hand-painted Moroccan ceramic plate' },
    price: 249, oldPrice: 0, category: 'ديكور', stock: 25,
    tags: ['ceramic', 'plate', 'moroccan', 'handmade']
  },
  {
    name: { ar: 'سجادة مغربية', fr: 'Tapis Marocain', en: 'Moroccan Rug' },
    description: { ar: 'سجادة مغربية تقليدية من الصوف الطبيعي', fr: 'Tapis marocain traditionnel en laine naturelle', en: 'Traditional Moroccan rug in natural wool' },
    price: 1499, oldPrice: 1999, discount: 25, category: 'ديكور', stock: 8,
    isFeatured: true, tags: ['rug', 'moroccan', 'wool', 'traditional']
  }
];

const seed = async () => {
  const conn = await connectDB();

  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: 'Super Admin', email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, role: 'superadmin',
      permissions: ['manage_products', 'manage_orders', 'manage_users', 'manage_admins', 'manage_coupons', 'manage_tickets', 'view_reports']
    });
    console.log('Admin created');
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    for (const p of products) {
      p.slug = p.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await Product.create(p);
    }
    console.log(`${products.length} products seeded`);
  } else {
    console.log(`${productCount} products already exist`);
  }

  const couponExists = await Coupon.findOne({ code: 'WELCOME20' });
  if (!couponExists) {
    await Coupon.create({ code: 'WELCOME20', type: 'percentage', value: 20, minOrder: 200, maxUses: 100, expiresAt: new Date('2027-12-31') });
    await Coupon.create({ code: 'MORIS10', type: 'fixed', value: 50, minOrder: 300, maxUses: 50, expiresAt: new Date('2027-06-30') });
    console.log('Coupons created');
  }

  console.log('Seed complete!');
  process.exit(0);
};

seed();
