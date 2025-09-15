// backend/middleware/requireAuth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    // This case is for when the error occurs before the token is even checked
    res.locals.errorMessage = 'Authorization token is missing';
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach user info to the request object
    next();
  } catch (e) {
    res.locals.errorMessage = 'Authorization token is invalid or expired';
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = requireAuth;