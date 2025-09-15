// __tests__/health.test.js
const request = require('supertest');
const app = require('../app');

describe('health', () => {
  test('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status','ok');
    expect(res.body).toHaveProperty('db', true);
  });
});
