const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const api = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: '10kb' }));

app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ ok: false, message: 'Not found.' }));

app.get('/', (req, res) => res.json({ ok: true, service: 'Luzara Nova API' }));
app.use(errorHandler);

app.listen(env.port, '0.0.0.0', () => {
  console.log(`Luzara Nova listening on port ${env.port}`);
  if (!env.mail.resendApiKey || !env.mail.to) {
    console.warn('Contact email is not configured; set RESEND_API_KEY and NOTIFY_TO to enable submissions.');
  }
  if (env.isProd && env.corsOrigins.length === 0) {
    console.warn('CORS_ORIGIN is not configured; browser requests from the website will be blocked.');
  }
});
