const { CSRF_COOKIE_NAME } = require('../utils/cookie');

// Double-submit CSRF check. Only applies to state-changing methods — GET/HEAD/
// OPTIONS never need it (they shouldn't mutate anything, and exempting them
// keeps read-only pages working before a session/CSRF cookie even exists).
//
// Passes when the value in the (readable) csrfToken cookie matches the value
// in the X-CSRF-Token request header. A cross-site attacker's browser will
// auto-attach the auth cookie to a forged request, but same-origin policy
// prevents their page from reading the csrfToken cookie's value to also set
// a matching header — so the two can never agree on a forged request.
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

exports.csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF validation failed. Please refresh and try again.',
    });
  }

  next();
};
