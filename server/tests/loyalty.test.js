const request = require('supertest');
const app = require('../server');
const LoyaltyPoint = require('../models/LoyaltyPoint');
const Order = require('../models/Order');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Loyalty Routes', () => {
  describe('GET /api/loyalty (auth)', () => {
    it('should return loyalty points (zero by default)', async () => {
      const { user, token } = await createTestUser();
      const res = await request(app)
        .get('/api/loyalty')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('points', 0);
      expect(res.body).toHaveProperty('tier', 'bronze');
      expect(res.body.user.toString()).toBe(user._id.toString());
    });
  });

  it('should add points when an order is created', async () => {
    const { user, token } = await createTestUser();
    const product = await createProduct({ price: 200, stock: 5 });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ product: product._id, quantity: 1 }],
        shippingAddress: { street: '1 Test', city: 'City', country: 'Morocco' },
        paymentMethod: 'cod'
      });
    expect(orderRes.status).toBe(201);

    const loyaltyRes = await request(app)
      .get('/api/loyalty')
      .set('Authorization', `Bearer ${token}`);
    expect(loyaltyRes.status).toBe(200);
    expect(loyaltyRes.body.points).toBeGreaterThanOrEqual(200);
  });
});
