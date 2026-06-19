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
    res.json({ success: true, seats: event.seats, availableSeats: event.availableSeats, totalSeats: event.totalSeats });
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
