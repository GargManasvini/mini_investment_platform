const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// --- GET /logs -> Fetch all transaction logs for the current user ---
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, endpoint, http_method, status_code, error_message, created_at 
       FROM transaction_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
