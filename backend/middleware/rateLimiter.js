const rateLimit = require('express-rate-limit');

// General API limiter — generous, just stops abuse/scraping
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Strict limiter for auth endpoints — brute force / credential stuffing protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Very strict limiter for password reset requests — prevents email bombing
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset requests. Please try again in an hour.' },
});

// Payment endpoints — protect against order-creation spam
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many payment attempts. Please slow down.' },
});

module.exports = { apiLimiter, authLimiter, passwordResetLimiter, paymentLimiter };
