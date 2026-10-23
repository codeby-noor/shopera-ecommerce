const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_apextech_2026_portfolio_secure_token';

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database
    const [rows] = await db.query('SELECT id, name, email, role, phone, avatar_url FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists or session has expired.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
};

// Middleware to require admin privileges
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Administrator privileges required.'
    });
  }
  next();
};

// Optional token middleware (for endpoints that can behave differently if logged in)
const optionalToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const [rows] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
      if (rows && rows.length > 0) {
        req.user = rows[0];
      }
    }
  } catch (err) {
    // Ignore invalid token in optional mode
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalToken
};
