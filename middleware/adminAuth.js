const crypto = require('crypto');
const env = require('../config/env');

module.exports = (req, res, next) => {
  const supplied = String(req.get('x-admin-key') || '');
  const expected = env.adminKey;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  const ok = expected.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return res.status(401).json({ ok: false, message: 'Wrong admin key.' });
  next();
};
