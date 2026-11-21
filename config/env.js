const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  port: Number(process.env.PORT) || 3000,
  // Address(es) of the front end allowed to call this API, comma separated
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5180').split(',').map((o) => o.trim()).filter(Boolean),
  isProd: process.env.NODE_ENV === 'production',
  launchDate: process.env.LAUNCH_DATE || '2026-11-21T00:00:00+02:00',
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH || 'data/luzaranova.db'),
  adminKey: process.env.ADMIN_KEY || '',
  mail: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Luzara Nova Website',
    to: process.env.NOTIFY_TO || process.env.EMAIL_USER || '',
  },
};
