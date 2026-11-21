const clues = require('../config/clues');
const env = require('../config/env');
const { sendGuessEmail, sendContactEmail } = require('../utils/mailer');

const MAX_RECENT_GUESSES = 1000;
const recentGuesses = [];
let nextGuessId = 1;

function timestampUtc() {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}

// Public: launch date + clues (locked clue text is never included)
exports.getConfig = (req, res) => {
  const now = Date.now();
  res.json({
    launchDate: env.launchDate,
    serverTime: new Date(now).toISOString(),
    clues: clues.map((c) => {
      const unlocked = now >= new Date(c.unlocksAt).getTime();
      return { id: c.id, unlocksAt: c.unlocksAt, unlocked, text: unlocked ? c.text : null };
    }),
  });
};

// Email each guess and keep a bounded, process-local list for the admin API.
exports.createGuess = async (req, res, next) => {
  const d = req.guessData;
  if (recentGuesses.some((g) => g.email === d.email && g.guess.toLowerCase() === d.guess.toLowerCase())) {
    return res.status(200).json({ ok: true, message: 'We already have this guess from you. Good luck!' });
  }

  const row = { id: nextGuessId, ...d, emailed: 1, created_at: timestampUtc() };
  try {
    await sendGuessEmail(row);
  } catch (err) {
    return next(err);
  }

  recentGuesses.unshift(row);
  if (recentGuesses.length > MAX_RECENT_GUESSES) recentGuesses.pop();
  nextGuessId += 1;
  return res.status(201).json({ ok: true, message: 'Guess received. Watch your phone and email on launch day.' });
};

// Contact messages are emailed directly and are not retained by the server.
exports.createContact = async (req, res, next) => {
  try {
    await sendContactEmail({ ...req.contactData, created_at: timestampUtc() });
  } catch (err) {
    return next(err);
  }
  return res.status(201).json({ ok: true, message: 'Thank you. We will be in touch soon.' });
};

// Admin
exports.listGuesses = (req, res) => res.json({ ok: true, guesses: recentGuesses });

exports.exportCsv = (req, res) => {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = ['id', 'name', 'phone', 'email', 'guess', 'emailed', 'created_at'];
  const csv = [head.join(',')].concat(recentGuesses.map((r) => head.map((h) => cell(r[h])).join(','))).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="luzara-nova-guesses.csv"');
  res.send(csv);
};
