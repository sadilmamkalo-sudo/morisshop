const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoHelper = require('./helpers/mongo');
const { createAdminUser, createTestUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Analytics Routes', () => {
  const makeOrderData = (userId, productId, price, qty, overrides = {}) => ({
    user: userId,
    items: [{ product: productId, name: 'Analytics Product', price, quantity: qty }],
    itemsPrice: price * qty,
    totalPrice: price * qty,
    shippingAddress: { city: 'Casablanca', country: 'Morocco' },
    ...overrides
  });

  describe('GET /api/analytics/overview (admin)', () => {
    it('should return overview stats', async () => {
      const { user: admin, token } = await createAdminUser();
      const buyer = await (await createTestUser()).user;
      const product = await createProduct();
      await Order.create(makeOrderData(buyer._id, product._id, 100, 2));
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('revenue');
      expect(res.body).toHaveProperty('orders');
      expect(res.body).toHaveProperty('users');
      expect(res.body).toHaveProperty('products');
      expect(res.body.orders.value).toBe(1);
    });
  });

  describe('GET /api/analytics/daily (admin)', () => {
    it('should return daily sales data', async () => {
      const { token } = await createAdminUser();
      const buyer = await (await createTestUser()).user;
      const product = await createProduct();
      await Order.create(makeOrderData(buyer._id, product._id, 100, 1));
      const res = await request(app)
        .get('/api/analytics/daily?days=30')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/analytics/best-sellers (admin)', () => {
    it('should return best sellers', async () => {
      const { token } = await createAdminUser();
      const buyer = await (await createTestUser()).user;
      const product = await createProduct({ price: 50 });
      await Order.create(makeOrderData(buyer._id, product._id, 50, 5));
      const res = await request(app)
        .get('/api/analytics/best-sellers?limit=5')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
