// Centralizes the httpOnly auth-cookie config so every controller that issues
// or clears a session token does it identically. The JWT itself still also
// goes out in the JSON body (see authController) for backward compatibility
// with any non-browser client (mobile apps, Postman, etc) that can't rely on
// cookies — but the browser frontend is migrated to use the cookie exclusively
// and no longer persists the token in localStorage.
//
// Because the auth cookie must be sameSite:'none' in production (frontend and
// backend typically live on different subdomains), it carries no CSRF
// protection on its own — sameSite:'none' tells the browser to attach it on
// every cross-site request, forged or not. We pair it with a double-submit
// CSRF token: a second, non-httpOnly cookie whose value the frontend must
// also echo back as a custom request header on any mutating request. A
// cross-site attacker can make the browser *send* the auth cookie, but can't
// *read* the CSRF cookie's value (browsers don't allow cross-origin cookie
// reads) to also forge the matching header — see middleware/csrf.js.

const crypto = require('crypto');

const COOKIE_NAME = 'token';
const CSRF_COOKIE_NAME = 'csrfToken';

const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = () => ({
  secure: isProd, // requires HTTPS in production; allow http for local dev
  sameSite: isProd ? 'none' : 'lax', // 'none' needed if frontend/backend are on different domains in prod
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — keep in sync with JWT_EXPIRE
  path: '/',
});

exports.setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, { ...baseCookieOptions(), httpOnly: true });
};

exports.clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { ...baseCookieOptions(), httpOnly: true, maxAge: undefined });
};

// Issues a fresh CSRF token and sets it as a readable (non-httpOnly) cookie.
// Call this alongside setAuthCookie wherever a session starts.
exports.setCsrfCookie = (res) => {
  const csrfToken = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, csrfToken, { ...baseCookieOptions(), httpOnly: false });
  return csrfToken;
};

exports.clearCsrfCookie = (res) => {
  res.clearCookie(CSRF_COOKIE_NAME, { ...baseCookieOptions(), httpOnly: false, maxAge: undefined });
};

exports.COOKIE_NAME = COOKIE_NAME;
exports.CSRF_COOKIE_NAME = CSRF_COOKIE_NAME;
