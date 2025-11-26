const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const chalk = require('chalk').default || require('chalk');
const config = require('./config');
const { connectDB } = require('./db');
// Register schemas before any populate calls
require('./models/school');
require('./models/role');
require('./models/user');
require('./models/student');
require('./models/feeBill');
require('./models/transaction');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
// Request logging with timing and status (colored)
const colorStatus = (status) => {
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  return chalk.green(status);
};

app.use(
  morgan((tokens, req, res) => {
    if (req.url === '/health') return null;
    const method = chalk.blue(tokens.method(req, res));
    const url = chalk.white(tokens.url(req, res));
    const status = colorStatus(Number(tokens.status(req, res)));
    const time = chalk.magenta(`${tokens['response-time'](req, res)} ms`);
    const len = tokens.res(req, res, 'content-length') || 0;
    return `[${tokens.date(req, res, 'iso')}] ${method} ${url} ${status} ${len} - ${time}`;
  })
);

app.get(['/health', '/api/health'], (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${config.port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();

module.exports = app;
