const request = require('supertest');
const app = require('../server');
const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createAdminUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Reviews Routes', () => {
  let user, token, product;

  beforeEach(async () => {
    const u = await createTestUser();
    user = u.user;
    token = u.token;
    product = await createProduct();
  });

  describe('POST /api/reviews (auth)', () => {
    it('should add a review', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, rating: 5, title: 'Great!', comment: 'Excellent product' });
      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(5);
      expect(res.body.product.toString()).toBe(product._id.toString());
    });

    it('should return 400 for duplicate review', async () => {
      await Review.create({ product: product._id, user: user._id, rating: 4, comment: 'Nice' });
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, rating: 5, title: 'Again', comment: 'Second review' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already reviewed/i);
    });
  });

  describe('GET /api/reviews/product/:id', () => {
    it('should return product reviews with stats', async () => {
      await Review.create({ product: product._id, user: user._id, rating: 4, comment: 'Good' });
      const res = await request(app).get(`/api/reviews/product/${product._id}`);
      expect(res.status).toBe(200);
      expect(res.body.reviews).toHaveLength(1);
      expect(res.body.stats).toHaveProperty('avg');
      expect(res.body.stats).toHaveProperty('distribution');
    });
  });

  describe('PUT /api/reviews/:id (auth)', () => {
    it('should update own review', async () => {
      const review = await Review.create({ product: product._id, user: user._id, rating: 3, comment: 'Okay' });
      const res = await request(app)
        .put(`/api/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 5, comment: 'Updated! Actually great' });
      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(5);
    });

    it('should return 404 for non-existent review', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app)
        .put(`/api/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rating: 4 });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/reviews/:id (auth)', () => {
    it('should delete own review', async () => {
      const review = await Review.create({ product: product._id, user: user._id, rating: 3, comment: 'Meh' });
      const res = await request(app)
        .delete(`/api/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const deleted = await Review.findById(review._id);
      expect(deleted).toBeNull();
    });
  });
});
