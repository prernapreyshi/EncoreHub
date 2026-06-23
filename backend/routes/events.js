const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, getEventSeats, holdSeats, releaseSeats, getAnalytics } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/analytics', protect, admin, getAnalytics);
router.get('/:id', getEventById);
router.get('/:id/seats', getEventSeats);
router.post('/:id/seats/hold', protect, holdSeats);
router.post('/:id/seats/release', protect, releaseSeats);
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
