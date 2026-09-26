const db = require('../db');

/**
 * Auth middleware for this project.
 * The frontend stores a mock token shaped like: `jwt-${userId}-${timestamp}` in localStorage.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!token.startsWith('jwt-')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rest = token.slice('jwt-'.length);
    const userIdPart = rest.split('-')[0];
    const userId = Number.parseInt(userIdPart, 10);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await db.execute('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.auth = {
      userId: rows[0].id,
      role: rows[0].role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
}

module.exports = { authenticate };

