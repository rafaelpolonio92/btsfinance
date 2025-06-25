const request = require('supertest');
const express = require('express');

// Router under test
const itemsRouter = require('../src/routes/items');

// Helper to build an isolated app for each test suite
function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  return app;
}

describe('Items API routes', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/items', () => {
    it('should return paginated items with defaults', async () => {
      const res = await request(app).get('/api/items');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      // with seed data it should be 5 items
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.items.length).toBe(res.body.total);
    });

    it('should respect limit param', async () => {
      const res = await request(app).get('/api/items').query({ limit: 2 });
      expect(res.statusCode).toBe(200);
      expect(res.body.items.length).toBe(2);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
    });

    it('should filter results by query string `q`', async () => {
      const res = await request(app).get('/api/items').query({ q: 'laptop' });
      expect(res.statusCode).toBe(200);
      // Only "Laptop Pro" matches in seed data
      expect(res.body.total).toBe(1);
      expect(res.body.items[0].name.toLowerCase()).toContain('laptop');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item when id exists', async () => {
      const res = await request(app).get('/api/items/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('should return 404 when item is not found', async () => {
      const res = await request(app).get('/api/items/99999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });
});