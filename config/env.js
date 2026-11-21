const path = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  port: Number(process.env.PORT) || 3000,
  // Address(es) of the front end allowed to call this API, comma separated
  corsOrigins: (process.env.CORS_ORIGIN || (isProd ? '' : 'http://localhost:5173')).split(',').map((o) => o.trim()).filter(Boolean),
  isProd,
  launchDate: process.env.LAUNCH_DATE || '2026-11-21T00:00:00+02:00',
  adminKey: process.env.ADMIN_KEY || '',
  mail: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Luzara Nova Website',
    to: process.env.NOTIFY_TO || process.env.EMAIL_USER || '',
  },
};
