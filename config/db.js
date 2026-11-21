const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const env = require('./env');

fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

const db = new Database(env.dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS guesses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL,
    email      TEXT NOT NULL,
    guess      TEXT NOT NULL,
    emailed    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_guesses_email ON guesses(email);
  CREATE TABLE IF NOT EXISTS contact_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    phone      TEXT NOT NULL DEFAULT '',
    interest   TEXT NOT NULL DEFAULT '',
    message    TEXT NOT NULL,
    emailed    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
