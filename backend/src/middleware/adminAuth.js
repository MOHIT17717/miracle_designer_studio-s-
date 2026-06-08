const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ADMIN_COOKIE_NAME = 'admin_token';

function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function adminLogin(req, res) {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });

  const secretHash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secretHash || !secret) {
    return res.status(500).json({ error: 'Admin not configured' });
  }

  const ok = await bcrypt.compare(password, secretHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '7d' });

  // Cookie security: for production put HTTPS + proper domain.
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({ ok: true });
}

function adminLogout(req, res) {
  res.clearCookie(ADMIN_COOKIE_NAME);
  return res.json({ ok: true });
}

module.exports = {
  requireAdmin,
  adminLogin,
  adminLogout,
};

