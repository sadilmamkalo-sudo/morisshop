const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');

router.get('/products', protect, adminOnly, hasPermission('manage_products'), async (req, res) => {
  try {
    const products = await Product.find().lean();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Products');
    ws.columns = [
      { header: 'Name (EN)', key: 'name_en', width: 30 },
      { header: 'Name (FR)', key: 'name_fr', width: 30 },
      { header: 'Name (AR)', key: 'name_ar', width: 30 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Featured', key: 'isFeatured', width: 10 }
    ];
    products.forEach(p => ws.addRow({ name_en: p.name?.en, name_fr: p.name?.fr, name_ar: p.name?.ar, price: p.price, category: p.category, stock: p.stock, isFeatured: p.isFeatured ? 'Yes' : 'No' }));
    ws.getRow(1).font = { bold: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/orders', protect, adminOnly, hasPermission('manage_orders'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').lean();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Orders');
    ws.columns = [
      { header: 'Order ID', key: '_id', width: 28 },
      { header: 'Customer', key: 'customer', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Total', key: 'totalPrice', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'date', width: 20 }
    ];
    orders.forEach(o => ws.addRow({ _id: o._id.toString().slice(-8), customer: o.user?.name || 'N/A', email: o.user?.email || 'N/A', totalPrice: o.totalPrice, status: o.status, date: new Date(o.createdAt).toLocaleDateString() }));
    ws.getRow(1).font = { bold: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', protect, adminOnly, hasPermission('manage_users'), async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Users');
    ws.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Active', key: 'isActive', width: 10 },
      { header: 'Joined', key: 'joined', width: 20 }
    ];
    users.forEach(u => ws.addRow({ name: u.name, email: u.email, role: u.role, isActive: u.isActive ? 'Yes' : 'No', joined: new Date(u.createdAt).toLocaleDateString() }));
    ws.getRow(1).font = { bold: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), fileFilter: (req, file, cb) => { cb(null, file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype === 'text/csv'); } });

router.post('/import/products', protect, adminOnly, hasPermission('manage_products'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.getWorksheet(1);
    let imported = 0;
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const [name_en, name_fr, name_ar, price, category, stock, desc_en, desc_fr, desc_ar] = row.values.slice(1);
      if (name_en && price) {
        Product.create({ name: { en: name_en, fr: name_fr || name_en, ar: name_ar || name_en }, description: { en: desc_en || name_en, fr: desc_fr || desc_en || name_en, ar: desc_ar || desc_en || name_en }, price: Number(price), category: category || 'General', stock: Number(stock) || 0 });
        imported++;
      }
    });
    res.json({ message: `${imported} products imported` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
