const request = require('supertest');
const app = require('../server');
const GiftCard = require('../models/GiftCard');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createAdminUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Gift Cards Routes', () => {
  describe('POST /api/gift-cards (auth)', () => {
    it('should create a gift card', async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .post('/api/gift-cards')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 200, recipientEmail: 'friend@test.com', message: 'Happy Birthday!', senderName: 'Test User' });
      expect(res.status).toBe(201);
      expect(res.body.code).toMatch(/^GIFT-/);
      expect(res.body.amount).toBe(200);
      expect(res.body.balance).toBe(200);
    });

    it('should reject amount below 50', async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .post('/api/gift-cards')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 10 });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/gift-cards/validate', () => {
    it('should validate a valid gift card', async () => {
      const card = await GiftCard.create({
        code: 'GIFT-VALID', amount: 100, balance: 100,
        expiresAt: new Date(Date.now() + 86400000)
      });
      const res = await request(app)
        .post('/api/gift-cards/validate')
        .send({ code: card.code });
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    it('should reject expired gift card', async () => {
      await GiftCard.create({
        code: 'GIFT-EXPIRED', amount: 50, balance: 50,
        expiresAt: new Date(Date.now() - 86400000)
      });
      const res = await request(app)
        .post('/api/gift-cards/validate')
        .send({ code: 'GIFT-EXPIRED' });
      expect(res.status).toBe(400);
      expect(res.body.valid).toBe(false);
    });
  });

  describe('GET /api/gift-cards (admin)', () => {
    it('should list all gift cards for admin', async () => {
      const { token } = await createAdminUser();
      await GiftCard.create({
        code: 'GIFT-001', amount: 100, balance: 100,
        expiresAt: new Date(Date.now() + 86400000)
      });
      const res = await request(app)
        .get('/api/gift-cards')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
