const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');

const createTestUser = async (overrides = {}) => {
  const data = {
    name: 'Test User',
    email: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: 'Test123456',
    phone: '0600000000',
    ...overrides
  };
  const user = await User.create(data);
  const token = generateToken(user._id);
  return { user, token };
};

const createAdminUser = async (overrides = {}) => {
  const data = {
    name: 'Admin User',
    email: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@test.com`,
    password: 'Test123456',
    role: 'admin',
    permissions: ['manage_products', 'manage_orders', 'manage_users', 'manage_admins', 'manage_coupons', 'manage_tickets', 'view_reports'],
    ...overrides
  };
  const user = await User.create(data);
  const token = generateToken(user._id);
  return { user, token };
};

const createProduct = async (overrides = {}) => {
  const Product = require('../../models/Product');
  const product = await Product.create({
    name: { ar: 'منتج', fr: 'Produit', en: 'Test Product' },
    description: { ar: 'وصف', fr: 'Description', en: 'Test Description' },
    price: 100,
    category: 'test',
    stock: 10,
    ...overrides
  });
  return product;
};

module.exports = { createTestUser, createAdminUser, createProduct };
