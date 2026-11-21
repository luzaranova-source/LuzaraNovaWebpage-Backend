const db = require('../config/db');
const clues = require('../config/clues');
const env = require('../config/env');
const { sendGuessEmail, sendContactEmail } =require('../utils/mailer');

const insert = db.prepare('INSERT INTO guesses (name, phone, email, guess) VALUES (@name, @phone, @email, @guess)');
const findById = db.prepare('SELECT * FROM guesses WHERE id = ?');
const findDup = db.prepare('SELECT id FROM guesses WHERE email = ? AND lower(guess) = lower(?)');
const markEmailed = db.prepare('UPDATE guesses SET emailed = 1 WHERE id = ?');
const listAll = db.prepare('SELECT * FROM guesses ORDER BY id DESC');

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

// Public: save a guess, then email it to the Luzara Nova inbox
exports.createGuess = (req, res, next) => {
  try {
    const d = req.guessData;
    if (findDup.get(d.email, d.guess)) {
      return res.status(200).json({ ok: true, message: 'We already have this guess from you. Good luck!' });
    }
    const { lastInsertRowid } = insert.run(d);
    const row = findById.get(lastInsertRowid);

    sendGuessEmail(row)
      .then((sent) => { if (sent) markEmailed.run(row.id); })
      .catch((err) => console.error('Email failed (guess is still saved):', err.message));

    res.status(201).json({ ok: true, message: 'Guess received. Watch your phone and email on launch day.' });
  } catch (err) {
    next(err);
  }
};

// Public: save a contact message from the main site, then email it
const insertContact = db.prepare('INSERT INTO contact_messages (name, email, phone, interest, message) VALUES (@name, @email, @phone, @interest, @message)');
const findContact = db.prepare('SELECT * FROM contact_messages WHERE id = ?');
const markContactEmailed = db.prepare('UPDATE contact_messages SET emailed = 1 WHERE id = ?');

exports.createContact = (req, res, next) => {
  try {
    const { lastInsertRowid } = insertContact.run(req.contactData);
    const row = findContact.get(lastInsertRowid);

    sendContactEmail(row)
      .then((sent) => { if (sent) markContactEmailed.run(row.id); })
      .catch((err) => console.error('Email failed (message is still saved):', err.message));

    res.status(201).json({ ok: true, message: 'Thank you. We will be in touch soon.' });
  } catch (err) {
    next(err);
  }
};

// Admin
exports.listGuesses = (req, res) => res.json({ ok: true, guesses: listAll.all() });

exports.exportCsv = (req, res) => {
  const cell = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = listAll.all();
  const head = ['id', 'name', 'phone', 'email', 'guess', 'emailed', 'created_at'];
  const csv = [head.join(',')].concat(rows.map((r) => head.map((h) => cell(r[h])).join(','))).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="luzara-nova-guesses.csv"');
  res.send(csv);
};
