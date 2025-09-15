// __tests__/auth.test.js
const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('Auth Routes', () => {

  // Clean up the database before and after the tests run
  beforeAll(async () => {
    // It's good practice to clear out test users before you start
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  afterAll(async () => {
    // Clean up any users created during the tests
    await pool.query("DELETE FROM users WHERE email LIKE '%@test.com'");
    // Close the database connection pool
    await pool.end();
  });

  // --- Test User Signup ---
  describe('POST /auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'testuser1@test.com',
          password: 'Password123!',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'testuser1@test.com');
    });

    it('should return 409 if user already exists', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'testuser1@test.com', // Same email as above
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should return 400 for missing required fields', async () => {
        const res = await request(app)
          .post('/auth/signup')
          .send({
            first_name: 'Test',
            // Missing email and password
          });
  
        expect(res.statusCode).toBe(400);
      });
  });

  // --- Test User Login ---
  describe('POST /auth/login', () => {
    it('should log in an existing user and return a token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser1@test.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser1@test.com',
          password: 'WrongPassword!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
        const res = await request(app)
          .post('/auth/login')
          .send({
            email: 'nouser@test.com',
            password: 'anypassword',
          });
  
        expect(res.statusCode).toBe(401);
      });
  });
});
