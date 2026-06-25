const request = require('supertest');
const app = require('../server');
const Coupon = require('../models/Coupon');
const mongoHelper = require('./helpers/mongo');
const { createAdminUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Coupons Routes', () => {
  describe('POST /api/coupons (admin)', () => {
    it('should create a coupon', async () => {
      const { token } = await createAdminUser();
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'SAVE20', type: 'percentage', value: 20,
          minOrder: 100, maxUses: 50,
          expiresAt: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(201);
      expect(res.body.code).toBe('SAVE20');
    });
  });

  describe('GET /api/coupons (admin)', () => {
    it('should list all coupons', async () => {
      const { token } = await createAdminUser();
      await Coupon.create({
        code: 'TEST10', type: 'fixed', value: 10,
        expiresAt: new Date(Date.now() + 86400000)
      });
      const res = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /api/coupons/validate', () => {
    it('should validate a valid coupon', async () => {
      await Coupon.create({
        code: 'VALID20', type: 'percentage', value: 20,
        minOrder: 50, maxUses: 100, expiresAt: new Date(Date.now() + 86400000)
      });
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'VALID20', orderTotal: 200 });
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    it('should reject an expired coupon', async () => {
      await Coupon.create({
        code: 'EXPIRED', type: 'percentage', value: 10,
        expiresAt: new Date(Date.now() - 86400000)
      });
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'EXPIRED', orderTotal: 100 });
      expect(res.status).toBe(400);
      expect(res.body.valid).toBe(false);
    });

    it('should reject an exhausted coupon', async () => {
      await Coupon.create({
        code: 'EXHAUSTED', type: 'fixed', value: 5,
        maxUses: 10, usedCount: 10, expiresAt: new Date(Date.now() + 86400000)
      });
      const res = await request(app)
        .post('/api/coupons/validate')
        .send({ code: 'EXHAUSTED', orderTotal: 100 });
      expect(res.status).toBe(400);
      expect(res.body.valid).toBe(false);
    });
  });
});
