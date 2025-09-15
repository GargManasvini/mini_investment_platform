const express = require('express');
const pool = require('../db');
const { body, validationResult } = require('express-validator');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin'); // Assuming you have this from before
const router = express.Router();


// --- AI SIMULATION: Product Description Generator ---
// This function takes structured product data and generates a user-friendly description.
const generateAIDescription = (product) => {
  const { name, investment_type, annual_yield, tenure_months, risk_level, min_investment } = product;
  
  let typeDescription = '';
  switch (investment_type) {
    case 'bond':
      typeDescription = `As a corporate bond, it offers a predictable return stream, making it a reliable choice.`;
      break;
    case 'fd':
      typeDescription = `This Fixed Deposit (FD) provides a guaranteed return, ensuring your capital is secure.`;
      break;
    case 'mf':
      typeDescription = `This Mutual Fund (MF) diversifies your investment across various assets, managed by professional fund managers.`;
      break;
    case 'etf':
      typeDescription = `As an Exchange Traded Fund (ETF), it offers the diversification of a mutual fund with the flexibility of stock trading.`;
      break;
    default:
      typeDescription = `This is a unique investment opportunity with distinct characteristics.`;
  }

  const riskDescription = `With a ${risk_level} risk profile, it is best suited for investors with a corresponding appetite for risk.`;
  const formattedMinInvestment = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(min_investment || 1000);

  return `${name} is a promising investment opportunity providing a solid annual yield of ${annual_yield}%. ` +
         `With a lock-in period of ${tenure_months} months, it's designed for medium to long-term growth. ` +
         `${typeDescription} The minimum investment required is ${formattedMinInvestment}. ` +
         `${riskDescription}`;
};


// (Validation rules and other routes remain the same)
const productValidationRules = [
  body('name').notEmpty().withMessage('Name is required').isString(),
  body('investment_type').isIn(['bond', 'fd', 'mf', 'etf', 'other']).withMessage('Invalid investment type'),
  body('tenure_months').isInt({ min: 1 }).withMessage('Tenure must be a positive integer'),
  body('annual_yield').isDecimal({ decimal_digits: '1,2' }).withMessage('Annual yield must be a decimal'),
  body('risk_level').isIn(['low', 'moderate', 'high']).withMessage('Invalid risk level'),
];


// --- ADMIN CREATE: Now with AI Integration ---
router.post('/', requireAuth, requireAdmin, productValidationRules, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment } = req.body;
    
    // --- STEP 1: Call the AI to generate a description ---
    // Note: We ignore any 'description' sent in the body and always generate a new one.
    const generatedDescription = generateAIDescription(req.body);

    // --- STEP 2: Insert the product with the AI-generated description ---
    const [result] = await pool.query(
      `INSERT INTO investment_products (name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description) VALUES (?,?,?,?,?,?,?,?)`,
      [name, investment_type, tenure_months, annual_yield, risk_level, min_investment || 1000, max_investment || null, generatedDescription]
    );
    
    res.status(201).json({ message: 'Product created successfully with AI-generated description' });
  } catch (err) { next(err); }
});


// --- Other CRUD routes (GET, PUT, DELETE) ---
// (The rest of your file with GET, PUT, and DELETE routes remains unchanged)

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM investment_products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM investment_products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const fields = req.body;
    if (Object.keys(fields).length === 0) return res.status(400).json({ message: 'No fields to update' });
    const setClause = Object.keys(fields).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(fields), req.params.id];
    const [result] = await pool.query(`UPDATE investment_products SET ${setClause} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated' });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM investment_products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
});


module.exports = router;
