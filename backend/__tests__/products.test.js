// __tests__/products.test.js

// Load general environment variables
require('dotenv').config();

const request = require('supertest');
let app;
let pool;

describe('Product Routes', () => {
  let adminToken;
  let userToken;
  let newProductId;

  // --- Setup: Isolate modules and create users for this test suite ---
  beforeAll(async () => {
    // FIX: Isolate module caches for this test suite
    jest.resetModules();
    // Set the specific environment variable for this test suite
    process.env.ADMINS = 'admintest@test.com';

    // FIX: Require the app and db connection *after* setting the environment
    app = require('../app');
    pool = require('../db');

    // Clean up previous test entries to ensure a fresh start
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    
    // Create Admin User
    await request(app).post('/auth/signup').send({
      first_name: 'Admin',
      email: 'admintest@test.com',
      password: 'adminpassword',
    });
    const adminLogin = await request(app).post('/auth/login').send({
      email: 'admintest@test.com',
      password: 'adminpassword',
    });
    adminToken = adminLogin.body.token;

    // Create Regular User
    await request(app).post('/auth/signup').send({
      first_name: 'User',
      email: 'usertest@test.com',
      password: 'userpassword',
    });
    const userLogin = await request(app).post('/auth/login').send({
      email: 'usertest@test.com',
      password: 'userpassword',
    });
    userToken = userLogin.body.token;
  });

  // --- Teardown: Clean up the database and close connections ---
  afterAll(async () => {
    await pool.query("DELETE FROM investment_products WHERE name LIKE 'Test Product%'");
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    await pool.end();
  });


  // --- Test Product Creation (Admin Only) ---
  describe('POST /products', () => {
    it('should NOT allow a regular user to create a product', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Product', investment_type: 'bond', tenure_months: 12, annual_yield: "5.0", risk_level: 'low' });
      
      expect(res.statusCode).toBe(403); // Forbidden
    });
    
    it('should allow an admin to create a product', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Product Alpha', investment_type: 'etf', tenure_months: 24, annual_yield: "8.5", risk_level: 'moderate' });
      
      expect(res.statusCode).toBe(201);
      
      const [product] = await pool.query("SELECT id FROM investment_products WHERE name = 'Test Product Alpha'");
      expect(product[0]).toBeDefined();
      newProductId = product[0].id;
    });
  });

  // --- Test Fetching Products (Public) ---
  describe('GET /products', () => {
    it('should allow anyone to fetch the list of products', async () => {
      const res = await request(app).get('/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });


  // --- Test Product Update (Admin Only) ---
  describe('PUT /products/:id', () => {
    it('should NOT allow a regular user to update a product', async () => {
      const res = await request(app)
        .put(`/products/${newProductId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ annual_yield: "9.0" });

      expect(res.statusCode).toBe(403);
    });

    it('should allow an admin to update a product', async () => {
      const res = await request(app)
        .put(`/products/${newProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ annual_yield: "9.5" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product updated successfully');
    });
  });


  // --- Test Product Deletion (Admin Only) ---
  describe('DELETE /products/:id', () => {
    it('should NOT allow a regular user to delete a product', async () => {
      const res = await request(app)
        .delete(`/products/${newProductId}`)
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(res.statusCode).toBe(403);
    });

    it('should allow an admin to delete a product', async () => {
      const res = await request(app)
        .delete(`/products/${newProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });

    it('should return 404 when trying to delete a non-existent product', async () => {
        const res = await request(app)
          .delete(`/products/${newProductId}`) // Same ID, but it's already deleted
          .set('Authorization', `Bearer ${adminToken}`);
          
        expect(res.statusCode).toBe(404);
    });
  });
});

