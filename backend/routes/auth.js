const express = require('express');
const router = express.Router();
const { register, login, googleLogin, forgotPassword, resetPassword, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const {
  registerRules, loginRules, googleLoginRules, forgotPasswordRules, resetPasswordRules, handleValidation,
} = require('../middleware/validators');

router.post('/register', authLimiter, registerRules, handleValidation, register);
router.post('/login', authLimiter, loginRules, handleValidation, login);
router.post('/google', authLimiter, googleLoginRules, handleValidation, googleLogin);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordRules, handleValidation, forgotPassword);
router.put('/reset-password/:token', authLimiter, resetPasswordRules, handleValidation, resetPassword);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
