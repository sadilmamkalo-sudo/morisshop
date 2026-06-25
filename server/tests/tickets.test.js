const request = require('supertest');
const app = require('../server');
const Ticket = require('../models/Ticket');
const mongoHelper = require('./helpers/mongo');
const { createTestUser, createAdminUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Tickets Routes', () => {
  describe('POST /api/tickets (auth)', () => {
    it('should create a ticket', async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'Help needed', message: 'I have an issue with my order', priority: 'high' });
      expect(res.status).toBe(201);
      expect(res.body.subject).toBe('Help needed');
      expect(res.body.status).toBe('open');
    });
  });

  describe('GET /api/tickets/mytickets (auth)', () => {
    it('should return user tickets', async () => {
      const { user, token } = await createTestUser();
      await Ticket.create({ user: user._id, subject: 'Issue 1', message: 'Details 1' });
      await Ticket.create({ user: user._id, subject: 'Issue 2', message: 'Details 2' });
      const res = await request(app)
        .get('/api/tickets/mytickets')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('POST /api/tickets/:id/respond (auth)', () => {
    it('should respond to a ticket', async () => {
      const { user, token } = await createTestUser();
      const ticket = await Ticket.create({ user: user._id, subject: 'Query', message: 'Help' });
      const res = await request(app)
        .post(`/api/tickets/${ticket._id}/respond`)
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Here is my response' });
      expect(res.status).toBe(200);
      expect(res.body.responses).toHaveLength(1);
    });
  });

  describe('PUT /api/tickets/:id/status (admin)', () => {
    it('should update ticket status', async () => {
      const { user } = await createTestUser();
      const { token: adminToken } = await createAdminUser();
      const ticket = await Ticket.create({ user: user._id, subject: 'Ticket', message: 'Content' });
      const res = await request(app)
        .put(`/api/tickets/${ticket._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'resolved' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('resolved');
    });
  });
});
