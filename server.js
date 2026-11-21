const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
require('./config/db'); // creates the database and tables on start
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

app.listen(env.port, () => {
  console.log(`Luzara Nova running on http://localhost:${env.port}`);
  if (!env.mail.pass) console.warn('EMAIL_PASS is empty: guesses will be saved but not emailed yet.');
});
