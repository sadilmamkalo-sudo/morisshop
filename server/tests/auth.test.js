const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const mongoHelper = require('./helpers/mongo');
const { createTestUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return token + user data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@test.com', password: 'Test123456', phone: '0611111111' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('New User');
      expect(res.body.email).toBe('new@test.com');
      expect(res.body.role).toBe('client');
    });

    it('should return 400 for duplicate email', async () => {
      await User.create({ name: 'Existing', email: 'dup@test.com', password: 'Test123456' });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Dupe', email: 'dup@test.com', password: 'Test123456' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return token for valid credentials', async () => {
      await User.create({ name: 'Login User', email: 'login@test.com', password: 'Test123456' });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@test.com', password: 'Test123456' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('login@test.com');
    });

    it('should return 401 for invalid password', async () => {
      await User.create({ name: 'User', email: 'badpw@test.com', password: 'Test123456' });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'badpw@test.com', password: 'WrongPassword' });
      expect(res.status).toBe(401);
    });

    it('should return 403 for deactivated account', async () => {
      await User.create({ name: 'Deact', email: 'deact@test.com', password: 'Test123456', isActive: false });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'deact@test.com', password: 'Test123456' });
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/deactivated/i);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile with valid token', async () => {
      const { token } = await createTestUser({ name: 'Profile User' });
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Profile User');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', phone: '0622222222' });
      expect(res.status).toBe(200);
      expect(res.body.user.name).toBe('Updated Name');
    });
  });

  describe('PUT /api/auth/password', () => {
    it('should update password with correct current password', async () => {
      const userData = { name: 'PW User', email: 'pw@test.com', password: 'Test123456' };
      const user = await User.create(userData);
      const token = require('../utils/generateToken')(user._id);
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'Test123456', newPassword: 'NewPass123' });
      expect(res.status).toBe(200);
      const updated = await User.findById(user._id);
      expect(await updated.comparePassword('NewPass123')).toBe(true);
    });

    it('should return 400 with wrong current password', async () => {
      const { token } = await createTestUser();
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'WrongPassword', newPassword: 'NewPass123' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/verify/:token', () => {
    it('should verify email with valid token', async () => {
      const user = await User.create({
        name: 'Verify Me', email: 'verify@test.com', password: 'Test123456',
        verificationToken: 'valid_verify_token_123'
      });
      const res = await request(app).get(`/api/auth/verify/${user.verificationToken}`);
      expect(res.status).toBe(200);
      const updated = await User.findById(user._id);
      expect(updated.isVerified).toBe(true);
      expect(updated.verificationToken).toBeUndefined();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      await User.create({ name: 'Reset', email: 'reset@test.com', password: 'Test123456' });
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@test.com' });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reset.*email/i);
    });
  });

  describe('POST /api/auth/reset-password/:token', () => {
    it('should reset password with valid token', async () => {
      const user = await User.create({
        name: 'Reset PW', email: 'resetpw@test.com', password: 'Test123456',
        resetPasswordToken: 'valid_reset_token',
        resetPasswordExpires: new Date(Date.now() + 3600000)
      });
      const res = await request(app)
        .post(`/api/auth/reset-password/${user.resetPasswordToken}`)
        .send({ password: 'NewPassword123' });
      expect(res.status).toBe(200);
      const updated = await User.findById(user._id);
      expect(await updated.comparePassword('NewPassword123')).toBe(true);
    });
  });
});
