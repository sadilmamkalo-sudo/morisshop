const request = require('supertest');
const app = require('../server');
const BlogPost = require('../models/BlogPost');
const mongoHelper = require('./helpers/mongo');
const { createAdminUser } = require('./helpers/auth');

beforeAll(async () => await mongoHelper.connect());
afterEach(async () => await mongoHelper.clear());
afterAll(async () => await mongoHelper.close());

describe('Blog Routes', () => {
  describe('POST /api/blog (admin)', () => {
    it('should create a blog post', async () => {
      const { user, token } = await createAdminUser();
      const res = await request(app)
        .post('/api/blog')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: { ar: 'خبر', fr: 'Actualité', en: 'News Post' },
          content: { ar: 'محتوى', fr: 'Contenu', en: 'Content here' },
          slug: 'news-post',
          tags: ['news', 'update'],
          published: true
        });
      expect(res.status).toBe(201);
      expect(res.body.slug).toBe('news-post');
      expect(res.body.published).toBe(true);
    });
  });

  describe('GET /api/blog', () => {
    it('should return only published posts', async () => {
      const { user } = await createAdminUser();
      await BlogPost.create({
        title: { ar: 'أ', fr: 'P', en: 'Published' },
        content: { ar: 'ج', fr: 'C', en: 'Content' },
        slug: 'published-post', author: user._id, published: true
      });
      await BlogPost.create({
        title: { ar: 'ب', fr: 'D', en: 'Draft' },
        content: { ar: 'د', fr: 'E', en: 'Draft content' },
        slug: 'draft-post', author: user._id, published: false
      });
      const res = await request(app).get('/api/blog');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].slug).toBe('published-post');
    });
  });

  describe('GET /api/blog/:slug', () => {
    it('should return a single post by slug', async () => {
      const { user } = await createAdminUser();
      const post = await BlogPost.create({
        title: { ar: 'أ', fr: 'P', en: 'My Post' },
        content: { ar: 'ج', fr: 'C', en: 'Content' },
        slug: 'my-post', author: user._id, published: true
      });
      const res = await request(app).get(`/api/blog/${post.slug}`);
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe('my-post');
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/blog/nonexistent-slug');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/blog/:id (admin)', () => {
    it('should update a blog post', async () => {
      const { user, token } = await createAdminUser();
      const post = await BlogPost.create({
        title: { ar: 'أ', fr: 'P', en: 'Original' },
        content: { ar: 'ج', fr: 'C', en: 'Original content' },
        slug: 'original', author: user._id, published: true
      });
      const res = await request(app)
        .put(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ published: false });
      expect(res.status).toBe(200);
      expect(res.body.published).toBe(false);
    });
  });

  describe('DELETE /api/blog/:id (admin)', () => {
    it('should delete a blog post', async () => {
      const { user, token } = await createAdminUser();
      const post = await BlogPost.create({
        title: { ar: 'أ', fr: 'P', en: 'Delete Me' },
        content: { ar: 'ج', fr: 'C', en: 'To be deleted' },
        slug: 'delete-me', author: user._id, published: false
      });
      const res = await request(app)
        .delete(`/api/blog/${post._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(await BlogPost.findById(post._id)).toBeNull();
    });
  });
});
