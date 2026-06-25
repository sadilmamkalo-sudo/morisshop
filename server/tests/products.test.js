const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const mongoHelper = require('./helpers/mongo');
const { createAdminUser, createProduct } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Products Routes', () => {
  beforeEach(async () => {
    await Product.create({
      name: { ar: 'منتج 1', fr: 'Produit 1', en: 'Product 1' },
      description: { ar: 'وصف 1', fr: 'Description 1', en: 'Description 1' },
      price: 50, category: 'electronics', stock: 5, isAvailable: true
    });
    await Product.create({
      name: { ar: 'منتج 2', fr: 'Produit 2', en: 'Product 2' },
      description: { ar: 'وصف 2', fr: 'Description 2', en: 'Description 2' },
      price: 150, category: 'clothing', stock: 10, isAvailable: true
    });
    await Product.create({
      name: { ar: 'منتج 3', fr: 'Produit 3', en: 'Product 3' },
      description: { ar: 'وصف 3', fr: 'Description 3', en: 'Description 3' },
      price: 200, category: 'electronics', stock: 0, isAvailable: false
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(3);
      expect(res.body).toHaveProperty('total', 3);
      expect(res.body).toHaveProperty('pages');
    });

    it('should filter by category', async () => {
      const res = await request(app).get('/api/products?category=clothing');
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].category).toBe('clothing');
    });

    it('should search by name term', async () => {
      const res = await request(app).get('/api/products?search=Product 1');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by id', async () => {
      const product = await Product.findOne({ 'name.en': 'Product 1' });
      const res = await request(app).get(`/api/products/${product._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name.en).toBe('Product 1');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new (require('mongoose').Types.ObjectId)();
      const res = await request(app).get(`/api/products/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products (admin)', () => {
    it('should create a product', async () => {
      const { token } = await createAdminUser();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: { ar: 'جديد', fr: 'Nouveau', en: 'New Product' },
          description: { ar: 'وصف', fr: 'Description', en: 'Description' },
          price: 99, category: 'test', stock: 20
        });
      expect(res.status).toBe(201);
      expect(res.body.name.en).toBe('New Product');
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await (require('./helpers/auth').createTestUser)();
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: { ar: 'x', fr: 'x', en: 'x' }, description: { ar: 'x', fr: 'x', en: 'x' }, price: 10, category: 'x', stock: 1 });
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/products/:id (admin)', () => {
    it('should update a product', async () => {
      const { token } = await createAdminUser();
      const product = await createProduct();
      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 250 });
      expect(res.status).toBe(200);
      expect(res.body.price).toBe(250);
    });
  });

  describe('DELETE /api/products/:id (admin)', () => {
    it('should delete a product', async () => {
      const { token } = await createAdminUser();
      const product = await createProduct();
      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const deleted = await Product.findById(product._id);
      expect(deleted).toBeNull();
    });
  });
});
