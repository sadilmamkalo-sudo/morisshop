const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');
const Return = require('../models/Return');
const Product = require('../models/Product');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createAdminUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Returns Routes', () => {
  const makeOrderData = (userId, productId, overrides = {}) => ({
    user: userId,
    items: [{ product: productId, name: 'Test Item', price: 100, quantity: 1 }],
    itemsPrice: 100,
    totalPrice: 100,
    shippingAddress: { street: '1 Test', city: 'City', country: 'Morocco' },
    status: 'delivered',
    ...overrides
  });

  describe('POST /api/returns (auth)', () => {
    it('should create a return request', async () => {
      const { user, token } = await createTestUser();
      const product = await createProduct();
      const order = await Order.create(makeOrderData(user._id, product._id));
      const res = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${token}`)
        .send({ orderId: order._id, items: [{ product: product._id, quantity: 1 }], reason: 'Defective item' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
      expect(res.body.reason).toBe('Defective item');
    });
  });

  describe('GET /api/returns/my (auth)', () => {
    it('should return user returns', async () => {
      const { user, token } = await createTestUser();
      const product = await createProduct();
      const order = await Order.create(makeOrderData(user._id, product._id));
      await Return.create({ order: order._id, user: user._id, items: [{ product: product._id, quantity: 1 }], reason: 'Wrong size' });
      const res = await request(app)
        .get('/api/returns/my')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /api/returns (admin)', () => {
    it('should return all returns for admin', async () => {
      const { user } = await createTestUser();
      const { token: adminToken } = await createAdminUser();
      const product = await createProduct();
      const order = await Order.create(makeOrderData(user._id, product._id));
      await Return.create({ order: order._id, user: user._id, items: [{ product: product._id, quantity: 1 }], reason: 'Damaged' });
      const res = await request(app)
        .get('/api/returns')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('PUT /api/returns/:id (admin)', () => {
    it('should update return status', async () => {
      const { user } = await createTestUser();
      const { token: adminToken } = await createAdminUser();
      const product = await createProduct();
      const order = await Order.create(makeOrderData(user._id, product._id));
      const ret = await Return.create({ order: order._id, user: user._id, items: [{ product: product._id, quantity: 1 }], reason: 'Faulty' });
      const res = await request(app)
        .put(`/api/returns/${ret._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', refundAmount: 100, adminNote: 'Approved' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('approved');
      expect(res.body.refundAmount).toBe(100);
    });
  });
});
