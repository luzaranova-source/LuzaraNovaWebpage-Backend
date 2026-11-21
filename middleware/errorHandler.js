const env = require('../config/env');

module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (res.headersSent) return next(err);

  const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode <= 599
    ? err.statusCode
    : 500;

  if (env.isProd) {
    console.error(`Request failed: ${req.method} ${req.path} (${statusCode})`);
  } else {
    console.error(err);
  }

  const messages = {
    502: 'We could not deliver your message right now. Please try again later.',
    503: 'Email delivery is not configured yet. Please try again later.',
  };
  res.status(statusCode).json({
    ok: false,
    message: messages[statusCode] || 'Something went wrong. Please try again.',
  });
};
