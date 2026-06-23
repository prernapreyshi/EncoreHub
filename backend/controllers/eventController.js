const Event = require('../models/Event');
const Booking = require('../models/Booking');

exports.getEvents = async (req, res) => {
  try {
    const { category, city, date, minPrice, maxPrice, search, featured, trending, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (featured === 'true') filter.isFeatured = true;
    if (trending === 'true') filter.isTrending = true;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    if (minPrice || maxPrice) {
      filter['price.standard'] = {};
      if (minPrice) filter['price.standard'].$gte = Number(minPrice);
      if (maxPrice) filter['price.standard'].$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { 'venue.name': new RegExp(search, 'i') },
      ];
    }
    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-seats');
    res.json({
      success: true,
      events,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEventSeats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('seats title availableSeats totalSeats');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Present seats with expired holds as available (don't mutate DB on a GET —
    // just shape the response; the next write op will clean them up for real).
    const now = Date.now();
    const seats = event.seats.map(s => {
      const expired = s.isBlocked && s.blockedUntil && s.blockedUntil.getTime() < now;
      return expired ? { ...s.toObject(), isBlocked: false, blockedBy: null, blockedUntil: null } : s;
    });
    const availableSeats = seats.filter(s => !s.isBooked && !s.isBlocked).length;

    res.json({ success: true, seats, availableSeats, totalSeats: event.totalSeats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Seat holds ──────────────────────────────────────────────────────────
// Temporarily reserve seats while a user is on the checkout/payment screen so
// a second user can't also "successfully" select and pay for the same seat.
// Holds expire automatically after HOLD_DURATION_MS; getEventSeats treats
// expired holds as free, and the atomic booking write in bookingController
// will refuse to honor a hold that's no longer valid for anyone but its owner.

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

exports.holdSeats = async (req, res) => {
  try {
    const { seatNumbers } = req.body;
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'seatNumbers must be a non-empty array' });
    }

    const now = new Date();
    const holdUntil = new Date(Date.now() + HOLD_DURATION_MS);

    // Only succeeds if every requested seat is currently free — i.e. not
    // booked, and either unblocked or held by an expired/foreign hold that's
    // lapsed. This single atomic update is what actually prevents the race.
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: seatNumbers },
              $or: [
                { isBooked: true },
                {
                  isBlocked: true,
                  blockedUntil: { $gt: now },
                  blockedBy: { $ne: req.user._id },
                },
              ],
            },
          },
        },
      },
      {
        $set: {
          'seats.$[seat].isBlocked': true,
          'seats.$[seat].blockedBy': req.user._id,
          'seats.$[seat].blockedUntil': holdUntil,
        },
      },
      {
        new: true,
        arrayFilters: [{ 'seat.seatNumber': { $in: seatNumbers } }],
      }
    );

    if (!event) {
      return res.status(409).json({
        success: false,
        message: 'One or more selected seats were just taken. Please pick different seats.',
      });
    }

    res.json({ success: true, holdUntil, message: 'Seats held for 5 minutes' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.releaseSeats = async (req, res) => {
  try {
    const { seatNumbers } = req.body;
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'seatNumbers must be a non-empty array' });
    }

    // Only release holds this user actually owns.
    await Event.updateOne(
      { _id: req.params.id },
      {
        $set: {
          'seats.$[seat].isBlocked': false,
          'seats.$[seat].blockedBy': null,
          'seats.$[seat].blockedUntil': null,
        },
      },
      {
        arrayFilters: [{ 'seat.seatNumber': { $in: seatNumbers }, 'seat.blockedBy': req.user._id }],
      }
    );

    res.json({ success: true, message: 'Hold released' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalUsers = await (require('../models/User')).countDocuments({ role: 'user' });
    const totalBookings = await Booking.countDocuments({ paymentStatus: 'paid' });
    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const topEvents = await Event.find().sort({ totalRevenue: -1 }).limit(5).select('title totalRevenue totalBookings category');
    const monthlyRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        bookings: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    const categoryStats = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    res.json({ success: true, analytics: { totalEvents, totalUsers, totalBookings, totalRevenue, topEvents, monthlyRevenue, categoryStats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
