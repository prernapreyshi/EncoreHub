const Razorpay = require('razorpay');
const crypto = require('crypto');
const Event = require('../models/Event');

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });
};

// Recomputes the amount to charge from the event's authoritative seat prices —
// never trusts a client-supplied total. Mirrors the calculation in
// bookingController.createBooking so the Razorpay charge and the eventual
// booking record can never disagree.
const computeAuthoritativeAmount = async (eventId, seatNumbers) => {
  const event = await Event.findById(eventId).select('seats');
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  const seatMap = new Map(event.seats.map(s => [s.seatNumber, s]));
  let subtotal = 0;
  for (const seatNumber of seatNumbers) {
    const seat = seatMap.get(seatNumber);
    if (!seat) {
      const err = new Error(`Seat ${seatNumber} does not exist on this event`);
      err.status = 400;
      throw err;
    }
    if (seat.isBooked) {
      const err = new Error(`Seat ${seatNumber} is already booked`);
      err.status = 409;
      throw err;
    }
    subtotal += seat.price;
  }
  const convenienceFee = Math.round(subtotal * 0.02);
  return subtotal + convenienceFee;
};

exports.createOrder = async (req, res) => {
  try {
    const { eventId, seatNumbers } = req.body;
    if (!eventId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'eventId and a non-empty seatNumbers array are required' });
    }

    const amount = await computeAuthoritativeAmount(eventId, seatNumbers);

    // For demo: simulate order creation when Razorpay keys not configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
      return res.json({
        success: true,
        order: {
          id: 'order_demo_' + Date.now(),
          amount: amount * 100,
          currency: 'INR',
          status: 'created',
        },
        key: 'rzp_test_demo',
        amount,
        demo: true,
      });
    }
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });
    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID, amount });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // Demo mode: skip verification
    if (razorpay_order_id?.startsWith('order_demo_')) {
      return res.json({ success: true, verified: true });
    }
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
