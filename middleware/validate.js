const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s\-()]{7,20}$/;

function clean(v) {
  return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
}

exports.validateGuess = (req, res, next) => {
  const body = req.body || {};

  // Honeypot: real people never fill this hidden field. Pretend success.
  if (clean(body.website)) return res.status(201).json({ ok: true, message: 'Guess received.' });

  const data = {
    name: clean(body.name),
    phone: clean(body.phone),
    email: clean(body.email).toLowerCase(),
    guess: typeof body.guess === 'string' ? body.guess.trim() : '',
  };

  const errors = {};
  if (data.guess.length < 3 || data.guess.length > 1000) errors.guess = 'Write your guess (3 to 1000 characters).';
  if (data.name.length < 2 || data.name.length > 100) errors.name = 'Enter your name.';
  if (!PHONE_RE.test(data.phone)) errors.phone = 'Enter a valid phone number, for example +263 77 123 4567.';
  if (!EMAIL_RE.test(data.email) || data.email.length > 254) errors.email = 'Enter a valid email address.';

  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  req.guessData = data;
  next();
};

const INTERESTS = ['Custom business system', 'Website', 'Creative / design', 'Something else'];

exports.validateContact = (req, res, next) => {
  const body = req.body || {};

  // Honeypot: pretend success for bots
  if (clean(body.website)) return res.status(201).json({ ok: true, message: 'Message received.' });

  const data = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    interest: clean(body.interest),
    message: typeof body.message === 'string' ? body.message.trim() : '',
  };

  const errors = {};
  if (data.name.length < 2 || data.name.length > 100) errors.name = 'Enter your name.';
  if (!EMAIL_RE.test(data.email) || data.email.length > 254) errors.email = 'Enter a valid email address.';
  if (data.phone && !PHONE_RE.test(data.phone)) errors.phone = 'Enter a valid phone number, for example +263 77 123 4567.';
  if (data.interest && !INTERESTS.includes(data.interest)) data.interest = '';
  if (data.message.length < 10 || data.message.length > 2000) errors.message = 'Tell us a little more (10 to 2000 characters).';

  if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });

  req.contactData = data;
  next();
};
