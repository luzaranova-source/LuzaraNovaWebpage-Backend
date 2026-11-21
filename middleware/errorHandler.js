module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ ok: false, message: 'Something went wrong. Please try again.' });
};
