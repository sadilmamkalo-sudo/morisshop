const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Wishlist Routes', () => {
  let user, token, product;

  beforeEach(async () => {
    const u = await createTestUser();
    user = u.user;
    token = u.token;
    product = await createProduct();
  });

  describe('GET /api/wishlist (auth)', () => {
    it('should return empty wishlist', async () => {
      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('POST /api/wishlist/:productId (auth)', () => {
    it('should add product to wishlist', async () => {
      const res = await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/added/i);
      expect(res.body.wishlist.map(id => id.toString())).toContain(product._id.toString());
    });

    it('should return 400 for duplicate product', async () => {
      user.wishlist.push(product._id);
      await user.save();
      const res = await request(app)
        .post(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already in wishlist/i);
    });
  });

  describe('DELETE /api/wishlist/:productId (auth)', () => {
    it('should remove product from wishlist', async () => {
      user.wishlist.push(product._id);
      await user.save();
      const res = await request(app)
        .delete(`/api/wishlist/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/i);
    });
  });
});
