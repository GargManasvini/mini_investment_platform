// app.js
require('dotenv').config();
const express = require('express');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const investRoutes = require('./routes/investments');
const profileRoutes = require('./routes/profile'); 
const logRoutes = require('./routes/logs'); 

const cors = require("cors");
const transactionLogger = require('./middleware/transactionLogger')



const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // allow frontend
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(transactionLogger);


// routes
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: true });
  } catch (e) {
    res.status(500).json({ status: 'error', db: false });
  }
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/invest', investRoutes);
app.use('/profile', profileRoutes); 
app.use('/logs', logRoutes);


// basic error handler (captures error message for transaction logger)
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.errorMessage = err.message || String(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

module.exports = app;
