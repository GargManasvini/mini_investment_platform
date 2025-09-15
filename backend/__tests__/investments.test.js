// __tests__/investments.test.js
require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('Investment and Wallet Routes', () => {
  let userToken;
  let userId;
  let productId;

  // --- Setup: Create a user and a product for testing ---
  beforeAll(async () => {
    // Clean up previous test entries
    await pool.query("DELETE FROM users WHERE email LIKE 'investtest@test.com'");
    await pool.query("DELETE FROM investment_products WHERE name = 'Test Investment Product'");

    // Create a new user for these tests
    const signupRes = await request(app).post('/auth/signup').send({
      first_name: 'Invest',
      last_name: 'Test',
      email: 'investtest@test.com',
      password: 'password123',
    });
    userToken = signupRes.body.token;
    userId = signupRes.body.user.id;

    // Create a product to invest in
    await pool.query(
      `INSERT INTO investment_products (name, investment_type, tenure_months, annual_yield, risk_level, min_investment) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Test Investment Product', 'bond', 12, "10.00", 'low', 1000]
    );
    const [productRows] = await pool.query("SELECT id FROM investment_products WHERE name = 'Test Investment Product'");
    productId = productRows[0].id;
  });

  // --- Teardown: Clean up all created data ---
  afterAll(async () => {
    // Clean up data created during the tests
    await pool.query("DELETE FROM investments WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM users WHERE email = 'investtest@test.com'");
    await pool.query("DELETE FROM investment_products WHERE name = 'Test Investment Product'");
    // FIX: Removed pool.end(). Closing the connection pool here causes other test files to fail.
    // Jest will handle closing the connection when the entire test process finishes.
  });


  // --- Test Wallet Functionality ---
  describe('Wallet Management', () => {
    it('should start with a wallet balance of 100000 (from signup)', async () => {
      const res = await request(app)
        .get('/invest/wallet')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.balance).toBe("100000.00");
    });

    it('should allow a user to deposit money into their wallet', async () => {
      const res = await request(app)
        .post('/invest/wallet/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 5000 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Deposit successful');
      expect(res.body.balance).toBe("105000.00");
    });
  });


  // --- Test Investment Functionality ---
  describe('POST /invest', () => {
    it('should NOT allow an investment if the balance is insufficient', async () => {
      const res = await request(app)
        .post('/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ product_id: productId, amount: 200000 }); // More than the balance

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Insufficient balance');
    });

    it('should allow a user to make a valid investment', async () => {
      const res = await request(app)
        .post('/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ product_id: productId, amount: 20000 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Invested');
    });

    it('should reflect the correct new balance in the wallet after investment', async () => {
      // Balance was 105000, investment was 20000. New balance should be 85000.
      const res = await request(app)
        .get('/invest/wallet')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.balance).toBe("85000.00");
    });
  });

  // --- Test Portfolio Fetching ---
  describe('GET /invest/portfolio', () => {
    it('should fetch the user\'s portfolio with the correct investment', async () => {
      const res = await request(app)
        .get('/invest/portfolio')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.investments).toHaveLength(1);
      expect(res.body.investments[0].product_id).toBe(productId);
      expect(res.body.investments[0].amount).toBe("20000.00");
      expect(res.body.summary.totalInvested).toBe(20000);
    });
  });
});

