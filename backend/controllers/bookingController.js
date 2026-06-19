const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');

exports.createBooking = async (req, res) => {
  try {
    const { eventId, seats, totalAmount, paymentId, orderId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Mark seats as booked
    const seatNumbers = seats.map(s => s.seatNumber);
    let bookedCount = 0;
    event.seats = event.seats.map(seat => {
      if (seatNumbers.includes(seat.seatNumber)) {
        if (seat.isBooked) throw new Error(`Seat ${seat.seatNumber} is already booked`);
        seat.isBooked = true;
        bookedCount++;
      }
      return seat;
    });
    event.availableSeats = event.seats.filter(s => !s.isBooked && !s.isBlocked).length;
    event.totalRevenue = (event.totalRevenue || 0) + totalAmount;
    event.totalBookings = (event.totalBookings || 0) + 1;
    await event.save();

    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      seats,
      totalAmount,
      paymentStatus: paymentId ? 'paid' : 'pending',
      bookingStatus: paymentId ? 'confirmed' : 'pending',
      paymentId: paymentId || '',
      orderId: orderId || '',
    });

    // Generate QR code
    const qrData = JSON.stringify({
      bookingRef: booking.bookingRef,
      event: event.title,
      seats: seatNumbers,
      date: event.date,
      user: req.user.name,
    });
    const qrCode = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCode;
    await booking.save();

    const populated = await Booking.findById(booking._id).populate('event', 'title date time venue image category city').populate('user', 'name email');
    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date time venue image category city')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date time venue image category city description')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    // Unbook seats
    const event = await Event.findById(booking.event);
    if (event) {
      const seatNumbers = booking.seats.map(s => s.seatNumber);
      event.seats = event.seats.map(seat => {
        if (seatNumbers.includes(seat.seatNumber)) seat.isBooked = false;
        return seat;
      });
      event.availableSeats = event.seats.filter(s => !s.isBooked && !s.isBlocked).length;
      event.totalRevenue = Math.max(0, (event.totalRevenue || 0) - booking.totalAmount);
      event.totalBookings = Math.max(0, (event.totalBookings || 0) - 1);
      await event.save();
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.refundAmount = booking.totalAmount;
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('event', 'title date category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
