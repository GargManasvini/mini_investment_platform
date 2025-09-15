// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// --- AI SIMULATION: Password Strength Checker ---
// This function simulates an AI analyzing a password based on common security rules.
const checkPasswordStrength = (password) => {
  const suggestions = [];
  let strength = 'Very Weak';

  if (password.length < 8) {
    suggestions.push('Use at least 8 characters.');
  }
  if (!/\d/.test(password)) {
    suggestions.push('Include at least one number (0-9).');
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Include at least one uppercase letter (A-Z).');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    suggestions.push('Include at least one special character (e.g., !@#$).');
  }

  // Calculate a score based on how many rules are met
  const score = 4 - suggestions.length;

  if (score === 4) strength = 'Very Strong';
  else if (score === 3) strength = 'Strong';
  else if (score === 2) strength = 'Moderate';
  else if (score === 1) strength = 'Weak';

  return { strength, suggestions };
};

// --- NEW ROUTE: AI Password Strength Analysis ---
router.post('/password-strength', (req, res) => {
  const { password } = req.body;
  // Ensure a password is provided and it's a string
  if (!password || typeof password !== 'string') {
    // Return a default weak state if no password is sent
    return res.json(checkPasswordStrength(''));
  }
  const feedback = checkPasswordStrength(password);
  res.json(feedback);
});


// helper: sign token
function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// signup
router.post('/signup', async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, risk_appetite } = req.body;
    if (!first_name || !email || !password) return res.status(400).json({ message: 'first_name, email, password required' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (first_name, last_name, email, password_hash, risk_appetite) VALUES (?,?,?,?,?)',
      [first_name, last_name, email, hashed, risk_appetite || 'moderate']);

    const [userRows] = await pool.query('SELECT id,email FROM users WHERE email = ?', [email]);
    const user = userRows[0];

    // create wallet with some default balance for testing (you may remove/change)
    await pool.query('INSERT INTO user_wallets (user_id, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance',
      [user.id, 100000.00]);

    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) { next(err); }
});

// login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) { next(err); }
});

// request password reset (OTP) - we will console.log OTP for now
router.post('/request-reset', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(404).json({ message: 'No user found' });

    const user = rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query('INSERT INTO password_resets (id, user_id, email, otp, expires_at) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), user.id, email, otp, expiresAt]);

    // In production you'd send email; for internship/testing we'll print OTP to server console
    console.log(`PASSWORD RESET OTP for ${email}: ${otp} (expires ${expiresAt.toISOString()})`);

    res.json({ message: 'OTP generated and (for test) logged to server console' });
  } catch (err) { next(err); }
});

// reset using OTP
router.post('/reset', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'email, otp, newPassword required' });

    const [rows] = await pool.query('SELECT id, user_id, expires_at, used FROM password_resets WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1', [email, otp]);
    if (!rows.length) return res.status(400).json({ message: 'Invalid OTP' });

    const r = rows[0];
    if (r.used) return res.status(400).json({ message: 'OTP already used' });
    const now = new Date();
    if (new Date(r.expires_at) < now) return res.status(400).json({ message: 'OTP expired' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashed, r.user_id]);
    await pool.query('UPDATE password_resets SET used = 1 WHERE id = ?', [r.id]);

    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
});

module.exports = router;

