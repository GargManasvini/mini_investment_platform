const express = require('express');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();

// --- Middleware to require auth ---
// Note: This is duplicated in other files. Consider moving to a shared middleware file later.
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Missing token' });

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// --- AI SIMULATION: Portfolio Insights Generator ---
const generatePortfolioInsights = (investments, user) => {
  if (!investments || investments.length === 0) {
    return {
      riskProfile: 'N/A',
      summary: 'No investments found. Start investing to get personalized insights!',
      distribution: {},
    };
  }

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  
  const distribution = { low: 0, moderate: 0, high: 0 };
  investments.forEach(inv => {
    if (distribution.hasOwnProperty(inv.risk_level)) {
      distribution[inv.risk_level] += Number(inv.amount);
    }
  });

  const percentageDistribution = {
    low: totalInvested > 0 ? ((distribution.low / totalInvested) * 100).toFixed(1) : 0,
    moderate: totalInvested > 0 ? ((distribution.moderate / totalInvested) * 100).toFixed(1) : 0,
    high: totalInvested > 0 ? ((distribution.high / totalInvested) * 100).toFixed(1) : 0,
  };

  let dominantRisk = 'balanced';
  if (percentageDistribution.low > 60) dominantRisk = 'conservative';
  if (percentageDistribution.high > 50) dominantRisk = 'aggressive';
  if (percentageDistribution.moderate > 60) dominantRisk = 'moderate';

  let summary = `Your portfolio appears to be ${dominantRisk}. It is primarily composed of ${percentageDistribution.low}% low-risk, ${percentageDistribution.moderate}% moderate-risk, and ${percentageDistribution.high}% high-risk assets.`;
  
  if (user.risk_appetite && dominantRisk.toLowerCase() !== user.risk_appetite) {
    summary += ` This may be a mismatch with your stated risk appetite of '${user.risk_appetite}'. You might consider rebalancing to better align with your goals.`;
  } else {
    summary += ` This aligns well with your stated risk appetite of '${user.risk_appetite}'.`;
  }

  return { riskProfile: dominantRisk, summary, distribution: percentageDistribution };
};


// --- NEW ROUTE: Get AI Portfolio Insights ---
router.get('/portfolio/insights', requireAuth, async (req, res, next) => {
  try {
    const [userRows] = await pool.query('SELECT risk_appetite FROM users WHERE id = ?', [req.user.id]);
    if (!userRows.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = userRows[0];
    
    const [investments] = await pool.query(
      `SELECT i.amount, p.risk_level 
       FROM investments i 
       JOIN investment_products p ON i.product_id = p.id 
       WHERE i.user_id = ? AND i.status = 'active'`,
      [req.user.id]
    );
    
    const insights = generatePortfolioInsights(investments, user);
    res.json(insights);
  } catch (err) {
    next(err);
  }
});


// --- POST /invest → make an investment ---
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { product_id, amount } = req.body;
    if (!product_id || !amount) {
      return res.status(400).json({ message: 'product_id and amount required' });
    }

    // fetch product
    const [pRows] = await pool.query(
      'SELECT * FROM investment_products WHERE id = ?',
      [product_id]
    );
    if (!pRows.length) return res.status(404).json({ message: 'Product not found' });
    const product = pRows[0];

    if (amount < Number(product.min_investment)) {
      return res
        .status(400)
        .json({ message: `Amount must be >= ${product.min_investment}` });
    }
    if (product.max_investment && amount > Number(product.max_investment)) {
      return res
        .status(400)
        .json({ message: `Amount must be <= ${product.max_investment}` });
    }

    // check wallet
    const [walletRows] = await pool.query(
      'SELECT balance FROM user_wallets WHERE user_id = ?',
      [req.user.id]
    );
    const balance = walletRows.length ? Number(walletRows[0].balance) : 0;
    if (amount > balance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // compute return
    const years = product.tenure_months / 12;
    const rate = Number(product.annual_yield) / 100;
    const maturityAmount = Number(amount) * Math.pow(1 + rate, years);
    const expected_return = parseFloat(maturityAmount.toFixed(2));
    const maturity_date = new Date();
    maturity_date.setMonth(maturity_date.getMonth() + Number(product.tenure_months));

    // insert investment + update wallet
    await pool.query(
      `INSERT INTO investments (user_id, product_id, amount, expected_return, maturity_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, product_id, amount, expected_return, maturity_date.toISOString().split('T')[0]]
    );

    await pool.query(
      'UPDATE user_wallets SET balance = balance - ? WHERE user_id = ?',
      [amount, req.user.id]
    );

    res.status(201).json({
      message: 'Invested',
      expected_return,
      maturity_date: maturity_date.toISOString().split('T')[0],
    });
  } catch (err) {
    next(err);
  }
});

// --- GET /invest/portfolio → portfolio summary + details ---
router.get('/portfolio', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.name, p.investment_type, p.annual_yield, p.tenure_months
       FROM investments i 
       JOIN investment_products p ON i.product_id = p.id
       WHERE i.user_id = ?
       ORDER BY i.invested_at DESC`,
      [req.user.id]
    );

    const totalInvested = rows.reduce((s, r) => s + Number(r.amount), 0);
    const totalExpected = rows.reduce((s, r) => s + Number(r.expected_return), 0);

    res.json({
      summary: { totalInvested, totalExpected },
      investments: rows,
    });
  } catch (err) {
    next(err);
  }
});

// --- GET /invest → list raw investments ---
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.name, p.investment_type, p.tenure_months, p.annual_yield
       FROM investments i
       JOIN investment_products p ON i.product_id = p.id
       WHERE i.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// --- GET /invest/wallet → check wallet balance ---
router.get('/wallet', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT balance FROM user_wallets WHERE user_id = ?',
      [req.user.id]
    );
    const balance = rows.length ? rows[0].balance : 0;
    res.json({ balance });
  } catch (err) {
    next(err);
  }
});

// --- POST /invest/wallet/deposit → add money to wallet ---
router.post('/wallet/deposit', requireAuth, async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }

    // check if wallet exists
    const [rows] = await pool.query(
      'SELECT balance FROM user_wallets WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length) {
      // update existing wallet
      await pool.query(
        'UPDATE user_wallets SET balance = balance + ? WHERE user_id = ?',
        [amount, req.user.id]
      );
    } else {
      // create wallet for user
      await pool.query(
        'INSERT INTO user_wallets (user_id, balance) VALUES (?, ?)',
        [req.user.id, amount]
      );
    }

    // return updated balance
    const [updated] = await pool.query(
      'SELECT balance FROM user_wallets WHERE user_id = ?',
      [req.user.id]
    );

    res.status(200).json({
      message: 'Deposit successful',
      balance: updated[0].balance,
    });
  } catch (err) {
    next(err);
  }
});


module.exports = router;

