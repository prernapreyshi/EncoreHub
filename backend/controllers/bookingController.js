const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/sendEmail');

const formatEventDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const sendBookingConfirmationEmail = async (booking, event, user) => {
  const seatList = booking.seats.map(s => `${s.seatNumber} (${s.type})`).join(', ');
  await sendEmail({
    email: user.email,
    subject: `Booking Confirmed — ${event.title} | EncoreHub`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0A0A0A;color:#fff">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:22px;font-weight:900">Encore<span style="color:#E50914">Hub</span></span>
      </div>
      <div style="background:#141414;border:1px solid #2A2A2A;border-radius:12px;padding:24px">
        <p style="color:#22c55e;font-weight:600;margin:0 0 16px">✓ Your booking is confirmed!</p>
        <h2 style="margin:0 0 8px;color:#fff">${event.title}</h2>
        <p style="color:#A3A3A3;margin:0 0 4px">${formatEventDate(event.date)} · ${event.time}</p>
        <p style="color:#A3A3A3;margin:0 0 16px">${event.venue?.name || ''}, ${event.city || ''}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px 0;color:#A3A3A3">Booking Reference</td><td style="padding:8px 0;text-align:right;color:#E50914;font-weight:700">${booking.bookingRef}</td></tr>
          <tr><td style="padding:8px 0;color:#A3A3A3">Seats</td><td style="padding:8px 0;text-align:right;color:#fff">${seatList}</td></tr>
          <tr><td style="padding:8px 0;color:#A3A3A3;border-top:1px solid #2A2A2A">Total Paid</td><td style="padding:8px 0;text-align:right;color:#fff;font-weight:700;border-top:1px solid #2A2A2A">₹${booking.totalAmount.toLocaleString('en-IN')}</td></tr>
        </table>
        <p style="color:#666;font-size:12px;margin-top:16px">Show your QR code (available on the EncoreHub app) at the venue entrance.</p>
      </div>
      <p style="text-align:center;color:#666;font-size:12px;margin-top:24px">© ${new Date().getFullYear()} EncoreHub. Need help? support@encorehub.com</p>
    </div>`,
  });
};

// ─── Atomic seat booking ────────────────────────────────────────────────────
// Uses findOneAndUpdate with an array filter that only matches seats that are
// still free.  If the document doesn't update (return null), the seats were
// already taken by a concurrent request — we return 409 Conflict.
// Session / transaction is attempted first; falls back gracefully on standalone
// mongod instances (common in local dev).

const bookSeatsAtomically = async (eventId, seatNumbers, totalAmount, userId, session) => {
  const opts = session
    ? { new: true, session, runValidators: false }
    : { new: true, runValidators: false };

  const now = new Date();

  return Event.findOneAndUpdate(
    {
      _id: eventId,
      seats: {
        $not: {
          $elemMatch: {
            seatNumber: { $in: seatNumbers },
            $or: [
              { isBooked: true },
              // Blocked by someone else, and that hold hasn't expired yet
              { isBlocked: true, blockedUntil: { $gt: now }, blockedBy: { $ne: userId } },
            ],
          },
        },
      },
    },
    {
      $set: {
        'seats.$[seat].isBooked': true,
        'seats.$[seat].isBlocked': false,
        'seats.$[seat].blockedBy': null,
        'seats.$[seat].blockedUntil': null,
      },
      $inc: {
        availableSeats: -seatNumbers.length,
        totalRevenue: totalAmount,
        totalBookings: 1,
      },
    },
    {
      ...opts,
      arrayFilters: [{ 'seat.seatNumber': { $in: seatNumbers } }],
    }
  );
};

exports.createBooking = async (req, res) => {
  const { eventId, seats, paymentId, orderId } = req.body;

  if (!eventId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ success: false, message: 'eventId and a non-empty seats array are required' });
  }
  if (seats.length > 8) {
    return res.status(400).json({ success: false, message: 'A maximum of 8 seats can be booked at once' });
  }

  const seatNumbers = [...new Set(seats.map(s => s.seatNumber))];
  if (seatNumbers.length !== seats.length) {
    return res.status(400).json({ success: false, message: 'Duplicate seats in request' });
  }

  let session = null;
  let committed = false;

  try {
    // Look up the event's REAL seat data first — never trust price/type from
    // the client. This is also where we validate every requested seat number
    // actually exists on this event before attempting the atomic write.
    const sourceEvent = await Event.findById(eventId).select('seats price title');
    if (!sourceEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const seatMap = new Map(sourceEvent.seats.map(s => [s.seatNumber, s]));
    const authoritativeSeats = [];
    for (const seatNumber of seatNumbers) {
      const seat = seatMap.get(seatNumber);
      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatNumber} does not exist on this event` });
      }
      authoritativeSeats.push({
        seatNumber: seat.seatNumber,
        row: seat.row,
        type: seat.type,
        price: seat.price, // authoritative — ignores whatever the client sent
      });
    }

    const subtotal = authoritativeSeats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = Math.round(subtotal * 0.02);
    const totalAmount = subtotal + convenienceFee;

    // Try to open a session (requires replica set)
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (_) {
      session = null; // standalone mongod — proceed without transaction
    }

    const event = await bookSeatsAtomically(eventId, seatNumbers, totalAmount, req.user._id, session);

    if (!event) {
      if (session) await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'One or more seats were just booked by someone else. Please choose different seats.',
      });
    }

    const createOpts = session ? [{ session }] : [{}];
    const bookingData = {
      user: req.user._id,
      event: eventId,
      seats: authoritativeSeats,
      totalAmount,
      paymentStatus: paymentId ? 'paid' : 'pending',
      bookingStatus: paymentId ? 'confirmed' : 'pending',
      paymentId: paymentId || '',
      orderId: orderId || '',
    };

    const booking = session
      ? (await Booking.create([bookingData], { session }))[0]
      : await Booking.create(bookingData);

    if (session) {
      await session.commitTransaction();
      committed = true;
    }

    // QR code — non-critical, outside transaction
    try {
      const qrData = JSON.stringify({
        bookingRef: booking.bookingRef,
        event: event.title,
        seats: seatNumbers,
        date: event.date,
        user: req.user.name,
      });
      booking.qrCode = await QRCode.toDataURL(qrData);
      await booking.save();
    } catch (qrErr) {
      console.warn('QR generation skipped:', qrErr.message);
    }

    const populated = await Booking.findById(booking._id)
      .populate('event', 'title date time venue image category city')
      .populate('user', 'name email');

    // Confirmation email — best-effort, never blocks or fails the response.
    if (populated.paymentStatus === 'paid') {
      sendBookingConfirmationEmail(populated, populated.event, populated.user).catch(emailErr =>
        console.warn('Booking confirmation email skipped:', emailErr.message)
      );
    }

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    if (session && !committed) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (session) session.endSession();
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };
    if (req.query.status && ['confirmed', 'cancelled', 'pending'].includes(req.query.status)) {
      filter.bookingStatus = req.query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('event', 'title date time venue image category city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      bookings,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
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
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  let session = null;
  let committed = false;

  try {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (_) {
      session = null;
    }

    const findOpts = session ? { session } : {};
    const booking = await Booking.findById(req.params.id, null, findOpts);

    if (!booking) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      if (session) await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.bookingStatus === 'cancelled') {
      if (session) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const seatNumbers = booking.seats.map(s => s.seatNumber);
    const updateOpts = session
      ? { session, runValidators: false }
      : { runValidators: false };

    await Event.findOneAndUpdate(
      { _id: booking.event },
      {
        $set: { 'seats.$[seat].isBooked': false },
        $inc: {
          availableSeats: seatNumbers.length,
          totalRevenue: -booking.totalAmount,
          totalBookings: -1,
        },
      },
      {
        ...updateOpts,
        arrayFilters: [{ 'seat.seatNumber': { $in: seatNumbers } }],
      }
    );

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    booking.refundAmount = booking.totalAmount;

    const saveOpts = session ? { session } : {};
    await booking.save(saveOpts);

    if (session) {
      await session.commitTransaction();
      committed = true;
    }

    res.json({ success: true, message: 'Booking cancelled and refund initiated', booking });
  } catch (err) {
    if (session && !committed) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (session) session.endSession();
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && ['confirmed', 'cancelled', 'pending'].includes(req.query.status)) {
      filter.bookingStatus = req.query.status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('event', 'title date category')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      bookings,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
