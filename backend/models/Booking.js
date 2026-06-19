const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  seats: [{
    seatNumber: String,
    row: String,
    type: String,
    price: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    default: '',
  },
  orderId: {
    type: String,
    default: '',
  },
  qrCode: {
    type: String,
    default: '',
  },
  bookingRef: {
    type: String,
    unique: true,
  },
  cancelledAt: {
    type: Date,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) {
    this.bookingRef = 'EH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
