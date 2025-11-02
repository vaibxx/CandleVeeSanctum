const jwt = require('jsonwebtoken');
const { query } = require('../utils/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const error = new Error('Access token required');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await query(
      'SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    next(error);
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, (err) => {
      if (err) return next(err);

      if (!req.user.is_admin) {
        const error = new Error('Admin access required');
        error.statusCode = 403;
        return next(error);
      }

      next();
    });
  } catch (error) {
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await query(
      'SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

module.exports = { auth, adminAuth, optionalAuth };