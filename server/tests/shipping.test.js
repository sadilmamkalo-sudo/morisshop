const request = require('supertest');
const app = require('../server');
const ShippingRate = require('../models/ShippingRate');
const mongoHelper = require('./helpers/mongo');
const { createAdminUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Shipping Routes', () => {
  describe('POST /api/shipping (admin)', () => {
    it('should add a shipping rate', async () => {
      const { token } = await createAdminUser();
      const res = await request(app)
        .post('/api/shipping')
        .set('Authorization', `Bearer ${token}`)
        .send({ city: 'Casablanca', region: 'Grand Casablanca', rate: 30, freeShippingMin: 300, estimatedDays: '1-2 days' });
      expect(res.status).toBe(201);
      expect(res.body.city).toBe('Casablanca');
    });
  });

  describe('GET /api/shipping', () => {
    it('should get all rates', async () => {
      await ShippingRate.create({ city: 'Rabat', region: 'Rabat-Sale', rate: 25, freeShippingMin: 300, estimatedDays: '2-3 days' });
      await ShippingRate.create({ city: 'Marrakech', region: 'Marrakech-Safi', rate: 35, freeShippingMin: 400, estimatedDays: '3-4 days' });
      const res = await request(app).get('/api/shipping');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /api/shipping/calculate', () => {
    it('should calculate shipping for a city', async () => {
      await ShippingRate.create({ city: 'Casablanca', region: 'Grand Casablanca', rate: 30, freeShippingMin: 300, estimatedDays: '1-2 days' });
      const res = await request(app)
        .post('/api/shipping/calculate')
        .send({ city: 'Casablanca', orderTotal: 100 });
      expect(res.status).toBe(200);
      expect(res.body.rate).toBe(30);
      expect(res.body.isFree).toBe(false);
    });

    it('should return free shipping when order exceeds threshold', async () => {
      await ShippingRate.create({ city: 'Casablanca', region: 'Grand Casablanca', rate: 30, freeShippingMin: 300, estimatedDays: '1-2 days' });
      const res = await request(app)
        .post('/api/shipping/calculate')
        .send({ city: 'Casablanca', orderTotal: 500 });
      expect(res.status).toBe(200);
      expect(res.body.rate).toBe(0);
      expect(res.body.isFree).toBe(true);
    });
  });

  describe('PUT /api/shipping/:id (admin)', () => {
    it('should update a shipping rate', async () => {
      const { token } = await createAdminUser();
      const rate = await ShippingRate.create({ city: 'Fes', region: 'Fes-Meknes', rate: 20, estimatedDays: '2 days' });
      const res = await request(app)
        .put(`/api/shipping/${rate._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ rate: 25 });
      expect(res.status).toBe(200);
      expect(res.body.rate).toBe(25);
    });
  });

  describe('DELETE /api/shipping/:id (admin)', () => {
    it('should delete a shipping rate', async () => {
      const { token } = await createAdminUser();
      const rate = await ShippingRate.create({ city: 'Tangier', region: 'Tangier-Tetouan', rate: 40, estimatedDays: '2-3 days' });
      const res = await request(app)
        .delete(`/api/shipping/${rate._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(await ShippingRate.findById(rate._id)).toBeNull();
    });
  });
});
