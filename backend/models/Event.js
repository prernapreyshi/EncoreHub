const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  type: { type: String, enum: ['standard', 'premium', 'vip'], default: 'standard' },
  price: { type: Number, required: true },
  isBooked: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  blockedUntil: { type: Date, default: null },
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Movies', 'Concerts', 'Sports', 'Comedy', 'Festivals', 'Theatre', 'Other'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    mapLink: { type: String, default: '' },
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  image: {
    type: String,
    default: '',
  },
  images: [{ type: String }],
  language: {
    type: String,
    default: 'English',
  },
  duration: {
    type: String,
    default: '',
  },
  ageRating: {
    type: String,
    default: 'U/A',
  },
  price: {
    standard: { type: Number, required: true },
    premium: { type: Number, default: 0 },
    vip: { type: Number, default: 0 },
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
  },
  seats: [seatSchema],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  tags: [{ type: String }],
  artists: [{ type: String }],
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Auto-generate seats if not provided
eventSchema.pre('save', function (next) {
  if (this.isNew && this.seats.length === 0) {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = Math.ceil(this.totalSeats / rows.length);
    const seats = [];
    let count = 0;
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow && count < this.totalSeats; i++) {
        const type = row <= 'B' ? 'vip' : row <= 'D' ? 'premium' : 'standard';
        const price = type === 'vip' ? (this.price.vip || this.price.standard * 2) :
                      type === 'premium' ? (this.price.premium || this.price.standard * 1.5) :
                      this.price.standard;
        seats.push({
          seatNumber: `${row}${i}`,
          row,
          type,
          price,
          isBooked: false,
          isBlocked: false,
        });
        count++;
      }
    }
    this.seats = seats;
  }
  const now = Date.now();
  this.availableSeats = this.seats.filter(
    s => !s.isBooked && (!s.isBlocked || (s.blockedUntil && s.blockedUntil.getTime() < now))
  ).length;
  next();
});

module.exports = mongoose.model('Event', eventSchema);
