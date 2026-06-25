const request = require('supertest');
const app = require('../server');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Newsletter = require('../models/Newsletter');
const mongoHelper = require('./helpers/mongo');
const { createAdminUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Newsletter Routes', () => {
  describe('POST /api/newsletter/subscribe', () => {
    it('should subscribe an email', async () => {
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'subscriber@test.com' });
      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/subscribed/i);
    });

    it('should return 400 for duplicate subscription', async () => {
      await NewsletterSubscriber.create({ email: 'dup@test.com' });
      const res = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'dup@test.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/newsletter/send (admin)', () => {
    it('should send a campaign', async () => {
      const { token } = await createAdminUser();
      await NewsletterSubscriber.create({ email: 'sub1@test.com' });
      await NewsletterSubscriber.create({ email: 'sub2@test.com' });
      const res = await request(app)
        .post('/api/newsletter/send')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'March Sale', content: '<h1>50% off everything!</h1>' });
      expect(res.status).toBe(201);
      expect(res.body.campaign.totalSent).toBe(2);
    });
  });

  describe('GET /api/newsletter (admin)', () => {
    it('should list campaigns', async () => {
      const { token } = await createAdminUser();
      await Newsletter.create({ subject: 'Campaign 1', content: 'Content 1', sentAt: new Date(), totalSent: 10 });
      const res = await request(app)
        .get('/api/newsletter')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });
});
