const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');
const { csrfProtection } = require('./middleware/csrf');

dotenv.config();
connectDB();

const app = express();

// Trust the first proxy hop (Render/Railway/Heroku/etc all sit behind one) so
// req.ip and rate-limiting see the real client IP instead of the proxy's.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Strip any keys starting with '$' or containing '.' from req.body/query/params
// to prevent MongoDB operator injection (e.g. { "email": { "$ne": null } }).
app.use(mongoSanitize());

// Baseline rate limit on all /api routes; auth/payment routes layer on
// stricter, endpoint-specific limiters (see routes/auth.js, routes/payments.js).
app.use('/api', apiLimiter);

// CSRF (double-submit cookie) on every mutating /api request EXCEPT the
// pre-session auth routes below — those issue/replace credentials themselves
// rather than acting on an existing session, so there's no session for a
// cross-site request to forge yet. Every other POST/PUT/PATCH/DELETE
// (bookings, payments, profile changes, admin actions, etc.) is covered.
const CSRF_EXEMPT_PATHS = new Set([
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/google',
  '/api/auth/forgot-password',
  '/api/auth/logout',
]);
app.use((req, res, next) => {
  if (CSRF_EXEMPT_PATHS.has(req.path) || req.path.startsWith('/api/auth/reset-password/')) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'EncoreHub API running' }));

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 EncoreHub server running on port ${PORT}`);
});

module.exports = app;
