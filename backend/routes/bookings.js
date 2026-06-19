// bookings.js
const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.get('/all', protect, admin, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
