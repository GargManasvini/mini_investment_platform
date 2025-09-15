const ADMIN_LIST = (process.env.ADMINS || '').split(',').map(s => s.trim()).filter(Boolean);

function requireAdmin(req, res, next) {
  // This middleware must run *after* requireAuth, so req.user will exist
  if (!req.user) {
    res.locals.errorMessage = 'Authentication required before admin check';
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if the authenticated user's email is in our admin list
  if (!ADMIN_LIST.includes(req.user.email)) {
    res.locals.errorMessage = 'User attempted to access admin-only route';
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  // If they are an admin, proceed to the next function
  next();
}

module.exports = requireAdmin;