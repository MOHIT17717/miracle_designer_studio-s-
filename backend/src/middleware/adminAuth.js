const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'auth_token';

// Hardcoded credentials as requested by user
const USERS = {
  '7418634741': { password: '802546', role: 'admin' },
  '9043758382': { password: '123456', role: 'user' },
};

function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.admin = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function login(req, res) {
  const { mobile, password } = req.body || {};
  if (!mobile || !password) return res.status(400).json({ error: 'Mobile and password required' });

  const user = USERS[mobile];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Auth not configured' });
  }

  const token = jwt.sign({ mobile, role: user.role }, secret, { expiresIn: '7d' });

  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ ok: true, role: user.role });
}

function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.json({ ok: true });
}

module.exports = {
  requireAdmin,
  login,
  logout,
  AUTH_COOKIE_NAME,
};

