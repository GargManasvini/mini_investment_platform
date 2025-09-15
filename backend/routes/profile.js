const express = require('express');
const pool = require('../db');
const { body, validationResult } = require('express-validator');
const requireAuth = require('../middleware/requireAuth'); // Use the shared auth middleware
const router = express.Router();

// --- GET /profile -> Fetch current user's details ---
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, risk_appetite FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});


// --- PUT /profile -> Update user's risk appetite ---
router.put(
  '/',
  requireAuth,
  // Input validation to ensure risk_appetite is one of the allowed values
  [
    body('risk_appetite')
      .isIn(['low', 'moderate', 'high'])
      .withMessage('Invalid risk appetite value.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { risk_appetite } = req.body;

      const [result] = await pool.query(
        'UPDATE users SET risk_appetite = ? WHERE id = ?',
        [risk_appetite, req.user.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'Profile updated successfully', risk_appetite });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
