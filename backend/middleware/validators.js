const { body, validationResult } = require('express-validator');

// Shared handler — call as the last middleware in a validation chain.
// Returns a clean 400 with all field errors if any rule failed.
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

exports.registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s.'-]+$/).withMessage('Name contains invalid characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

exports.loginRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.googleLoginRules = [
  body('email').trim().isEmail().withMessage('Invalid email from Google').normalizeEmail(),
  body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Invalid name from Google'),
  body('googleId').trim().notEmpty().withMessage('Missing Google ID'),
];

exports.forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
];

exports.resetPasswordRules = [
  body('password')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

exports.changePasswordRules = [
  body('currentPassword').optional({ checkFalsy: true }).isString(),
  body('newPassword')
    .isLength({ min: 6, max: 128 }).withMessage('New password must be at least 6 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),
];
