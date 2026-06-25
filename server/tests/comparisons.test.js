const request = require('supertest');
const app = require('../server');
const Comparison = require('../models/Comparison');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Comparisons Routes', () => {
  let user, token, product;

  beforeEach(async () => {
    const u = await createTestUser();
    user = u.user;
    token = u.token;
    product = await createProduct();
  });

  describe('POST /api/comparisons/:productId (auth)', () => {
    it('should add a product to comparison', async () => {
      const res = await request(app)
        .post(`/api/comparisons/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.products.map(p => p.toString())).toContain(product._id.toString());
    });

    it('should return 400 for duplicate product', async () => {
      await Comparison.create({ user: user._id, products: [product._id] });
      const res = await request(app)
        .post(`/api/comparisons/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/comparisons (auth)', () => {
    it('should get comparison list', async () => {
      await Comparison.create({ user: user._id, products: [product._id] });
      const res = await request(app)
        .get('/api/comparisons')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
    });

    it('should return empty products array when no comparison exists', async () => {
      const res = await request(app)
        .get('/api/comparisons')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
    });
  });

  describe('DELETE /api/comparisons/:productId (auth)', () => {
    it('should remove a product from comparison', async () => {
      await Comparison.create({ user: user._id, products: [product._id] });
      const res = await request(app)
        .delete(`/api/comparisons/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(0);
    });
  });
});
