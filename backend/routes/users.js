const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, toggleFavorite, getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { changePasswordRules, handleValidation } = require('../middleware/validators');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, authLimiter, changePasswordRules, handleValidation, changePassword);
router.put('/favorites/:eventId', protect, toggleFavorite);
router.get('/all', protect, admin, getAllUsers);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
