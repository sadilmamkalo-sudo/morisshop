const request = require('supertest');
const app = require('../server');
const Notification = require('../models/Notification');
const mongoHelper = require('./helpers/mongo');
const { createTestUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Notifications Routes', () => {
  let user, token;

  beforeEach(async () => {
    const u = await createTestUser();
    user = u.user;
    token = u.token;
  });

  describe('GET /api/notifications (auth)', () => {
    it('should get notifications and unread count', async () => {
      await Notification.create({ user: user._id, type: 'order', title: 'Order Placed', message: 'Your order was placed' });
      await Notification.create({ user: user._id, type: 'order', title: 'Order Shipped', message: 'Your order shipped', isRead: true });
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.notifications).toHaveLength(2);
      expect(res.body.unreadCount).toBe(1);
    });
  });

  describe('PUT /api/notifications/:id/read (auth)', () => {
    it('should mark a notification as read', async () => {
      const notif = await Notification.create({ user: user._id, type: 'system', title: 'Test', message: 'Test message' });
      const res = await request(app)
        .put(`/api/notifications/${notif._id}/read`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const updated = await Notification.findById(notif._id);
      expect(updated.isRead).toBe(true);
    });
  });

  describe('PUT /api/notifications/read-all (auth)', () => {
    it('should mark all notifications as read', async () => {
      await Notification.create({ user: user._id, type: 'order', title: 'N1', message: 'M1' });
      await Notification.create({ user: user._id, type: 'order', title: 'N2', message: 'M2' });
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const unread = await Notification.countDocuments({ user: user._id, isRead: false });
      expect(unread).toBe(0);
    });
  });
});
