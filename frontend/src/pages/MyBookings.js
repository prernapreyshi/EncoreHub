import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiClock, FiTag, FiDownload, FiXCircle, FiCheckCircle, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import { getUserBookings, cancelBooking } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';
import ConfirmModal from '../components/common/ConfirmModal';

const statusConfig = {
  confirmed: { icon: FiCheckCircle, color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', label: 'Confirmed' },
  cancelled:  { icon: FiXCircle,    color: 'text-red-400',   bg: 'bg-red-500/20 border-red-500/30',   label: 'Cancelled' },
  pending:    { icon: FiAlertCircle,color: 'text-yellow-400',bg: 'bg-yellow-500/20 border-yellow-500/30', label: 'Pending' },
};

const BookingCard = ({ booking, onCancel }) => {
  const event = booking.event;
  const status = statusConfig[booking.bookingStatus] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isPast = event?.date && new Date(event.date) < new Date();
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(booking._id);
      toast.success('Booking cancelled. Refund will be processed in 5–7 business days.');
      onCancel(booking._id);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancellation failed. Please try again.');
    } finally {
      setCancelling(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className={`card overflow-hidden transition-all hover:shadow-lg ${booking.bookingStatus === 'cancelled' ? 'opacity-70' : 'hover:shadow-primary/10'}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Event Image */}
        {event?.image && (
          <div className="sm:w-36 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-bold text-white text-base mb-1 line-clamp-1">{event?.title || 'Event'}</h3>
              <span className={`inline-flex items-center gap-1.5 badge text-xs border ${status.bg} ${status.color}`}>
                <StatusIcon className="w-3 h-3" /> {status.label}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-primary font-black text-lg">₹{booking.totalAmount?.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">{booking.seats?.length} ticket(s)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-3 h-3 text-primary flex-shrink-0" />
              {event?.date ? format(new Date(event.date), 'MMM d, yyyy') : 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <FiClock className="w-3 h-3 text-primary flex-shrink-0" />
              {event?.time || 'N/A'}
            </span>
            <span className="flex items-center gap-1.5 col-span-2">
              <FiMapPin className="w-3 h-3 text-primary flex-shrink-0" />
              {event?.venue?.name}, {event?.city}
            </span>
            <span className="flex items-center gap-1.5 col-span-2">
              <FiTag className="w-3 h-3 text-primary flex-shrink-0" />
              Ref: <span className="font-mono text-white">{booking.bookingRef}</span>
            </span>
          </div>

          {/* Seat badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {booking.seats?.map(seat => (
              <span key={seat.seatNumber} className={`badge text-xs py-1 ${seat.type === 'vip' ? 'bg-yellow-500/20 text-yellow-400' : seat.type === 'premium' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-300'}`}>
                {seat.seatNumber}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Link to={`/booking-confirmation/${booking._id}`}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white px-3 py-2 rounded-lg border border-dark-border hover:border-gray-500 transition-all">
              <FiDownload className="w-3.5 h-3.5" /> View Ticket
            </Link>
            {booking.bookingStatus === 'confirmed' && !isPast && (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={cancelling}
                className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 px-3 py-2 rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all"
              >
                <FiXCircle className="w-3.5 h-3.5" />
                Cancel Booking
              </button>
            )}
            {booking.bookingStatus === 'cancelled' && (
              <span className="text-xs text-gray-500 flex items-center gap-1.5 px-3 py-2">
                Refund: ₹{booking.refundAmount?.toLocaleString() || booking.totalAmount?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel Booking?"
        message={`You're about to cancel your booking for "${event?.title || 'this event'}". Your full payment of ₹${booking.totalAmount?.toLocaleString()} will be refunded within 5–7 business days.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep Booking"
        danger
      />
    </div>
  );
};

const PAGE_SIZE = 10;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPage = (pageNum, append = false) => {
    const setBusy = append ? setLoadingMore : setLoading;
    setBusy(true);
    return getUserBookings({ page: pageNum, limit: PAGE_SIZE })
      .then(({ data }) => {
        setBookings(prev => (append ? [...prev, ...data.bookings] : data.bookings));
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
        setPage(pageNum);
      })
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setBusy(false));
  };

  useEffect(() => { fetchPage(1, false); }, []);

  const handleLoadMore = () => {
    if (page < totalPages) fetchPage(page + 1, true);
  };

  const handleCancel = (id) => {
    setBookings(prev => prev.map(b => b._id === id
      ? { ...b, bookingStatus: 'cancelled', paymentStatus: 'refunded' }
      : b
    ));
  };

  const filtered = tab === 'all' ? bookings
    : tab === 'upcoming' ? bookings.filter(b => b.bookingStatus === 'confirmed' && new Date(b.event?.date) >= new Date())
    : tab === 'past' ? bookings.filter(b => new Date(b.event?.date) < new Date())
    : bookings.filter(b => b.bookingStatus === 'cancelled');

  const tabs = [
    { key: 'all', label: 'All', count: bookings.length },
    { key: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.bookingStatus === 'confirmed' && new Date(b.event?.date) >= new Date()).length },
    { key: 'past', label: 'Past', count: bookings.filter(b => new Date(b.event?.date) < new Date()).length },
    { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.bookingStatus === 'cancelled').length },
  ];

  return (
    <PageTransition>
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">My Bookings</h1>
            <p className="text-gray-400 mt-1">
              {bookings.length} of {total} booking{total !== 1 ? 's' : ''} loaded
            </p>
          </div>
          <Link to="/events" className="btn-primary py-2.5 px-5 text-sm">Book More</Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-dark-card border border-dark-border rounded-xl mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {t.label}
              {t.count > 0 && (
                <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ${tab === t.key ? 'bg-white/20' : 'bg-white/10'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-40 shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiBookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No bookings here</h3>
            <p className="text-gray-400 mb-6">
              {tab === 'upcoming' ? "You don't have any upcoming events." : "No bookings found in this category."}
            </p>
            <Link to="/events" className="btn-primary inline-block px-8">Discover Events</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filtered.map(b => <BookingCard key={b._id} booking={b} onCancel={handleCancel} />)}
            </div>
            {page < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-secondary px-8 py-3 inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingMore && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                  {loadingMore ? 'Loading…' : `Load More (${total - bookings.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </PageTransition>
  );
};

export default MyBookings;
