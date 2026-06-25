process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_EMAIL = 'admin@test.com';
process.env.ADMIN_PASSWORD = 'Test123456';
process.env.MONGO_URI = 'mongodb://localhost:27017/morisshop_test';
process.env.JWT_EXPIRE = '30d';
process.env.NODE_ENV = 'test';

jest.mock('../config/db', () => jest.fn().mockResolvedValue());
