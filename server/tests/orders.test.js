const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createAdminUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Orders Routes', () => {
  let user, token, product;

  beforeEach(async () => {
    const u = await createTestUser();
    user = u.user;
    token = u.token;
    product = await createProduct({ price: 100, stock: 10 });
  });

  const makeOrderData = (overrides = {}) => ({
    user: user._id,
    items: [{ product: product._id, name: 'Test Product', price: 100, quantity: 1, image: '' }],
    itemsPrice: 100,
    totalPrice: 100,
    shippingAddress: { street: '123 Test', city: 'Casablanca', country: 'Morocco' },
    trackingHistory: [{ status: 'pending', note: 'Order placed', updatedAt: new Date() }],
    ...overrides
  });

  describe('POST /api/orders (auth)', () => {
    it('should create an order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [{ product: product._id, quantity: 2 }],
          shippingAddress: { street: '123 Test St', city: 'Casablanca', country: 'Morocco' },
          paymentMethod: 'cod'
        });
      expect(res.status).toBe(201);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.itemsPrice).toBe(200);
      expect(res.body.totalPrice).toBe(200);
    });

    it('should return 400 with no items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ shippingAddress: {}, paymentMethod: 'cod' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/orders/myorders (auth)', () => {
    it('should return user orders', async () => {
      await Order.create(makeOrderData());
      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /api/orders/:id (auth)', () => {
    it('should return a single order', async () => {
      const order = await Order.create(makeOrderData());
      const res = await request(app)
        .get(`/api/orders/${order._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(order._id.toString());
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/orders/:id/status (admin)', () => {
    it('should update order status with tracking', async () => {
      const { token: adminToken } = await createAdminUser();
      const order = await Order.create(makeOrderData());
      const res = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped', note: 'Shipped via TestPost' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('shipped');
      expect(res.body.trackingHistory.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/orders (admin)', () => {
    it('should return all orders with pagination for admin', async () => {
      const { token: adminToken } = await createAdminUser();
      await Order.create(makeOrderData());
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('orders');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('pages');
      expect(res.body.orders).toHaveLength(1);
    });
  });
});
