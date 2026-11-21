const express = require('express');
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/guessController');
const { validateGuess, validateContact } = require('../middleware/validate');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const guessLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many messages. Please try again in a few minutes.' },
});

router.get('/config', ctrl.getConfig);
router.post('/guesses', guessLimiter, validateGuess, ctrl.createGuess);

router.post('/contact', contactLimiter, validateContact, ctrl.createContact);

router.get('/admin/guesses',adminAuth, ctrl.listGuesses);
router.get('/admin/guesses.csv', adminAuth, ctrl.exportCsv);

module.exports = router;
