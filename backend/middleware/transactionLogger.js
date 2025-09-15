const pool = require('../db'); // Import your database connection pool
const jwt = require('jsonwebtoken');

/**
 * This middleware logs details of every API request to the transaction_logs table.
 * It listens for the 'finish' event on the response object, which ensures that
 * logging happens *after* the request has been fully handled and a status code is available.
 */
const transactionLogger = (req, res, next) => {
  // We use the 'finish' event which is emitted when the response has been sent.
  res.on('finish', async () => {
    try {
      // --- 1. Extract Request Details ---
      const endpoint = req.originalUrl;
      const http_method = req.method;
      const status_code = res.statusCode;

      // --- 2. Extract User Details (if available) ---
      let userId = null;
      let userEmail = null;

      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
          // We decode the token here instead of relying on req.user,
          // because this middleware runs for ALL routes, even public ones.
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          userId = payload.id;
          userEmail = payload.email;
        } catch (e) {
          // Token is invalid or expired, log as an anonymous request
        }
      }

      // --- 3. Extract Error Message (if any) ---
      // We'll set this on res.locals in a separate error-handling middleware
      const errorMessage = res.locals.errorMessage || null;

      // --- 4. Insert into Database ---
      const sql = `
        INSERT INTO transaction_logs (user_id, email, endpoint, http_method, status_code, error_message)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await pool.query(sql, [userId, userEmail, endpoint, http_method, status_code, errorMessage]);

    } catch (dbError) {
      // If the logger itself fails, we log the error to the console
      // to avoid an infinite loop of logging failures.
      console.error('Failed to write transaction log:', dbError);
    }
  });

  // IMPORTANT: Call next() immediately to not block the request processing.
  // The 'finish' event listener above will do its work later.
  next();
};

module.exports = transactionLogger;
