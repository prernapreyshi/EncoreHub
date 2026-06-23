import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiDownload, FiCalendar, FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { getBookingById } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';

const BookingConfirmation = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [booking, setBooking] = useState(state?.booking || null);
  const [loading, setLoading] = useState(!state?.booking);

  useEffect(() => {
    if (!state?.booking) {
      getBookingById(id).then(({ data }) => setBooking(data.booking)).catch(() => toast.error('Failed to load booking')).finally(() => setLoading(false));
    }
  }, [id, state]);

  const downloadTicket = () => {
    const ticketEl = document.getElementById('ticket');
    if (!ticketEl) return;
    // Simple print-based PDF generation
    const printContent = ticketEl.innerHTML;
    const w = window.open('', '', 'width=600,height=800');
    w.document.write(`<html><body style="background:#000;color:#fff;font-family:sans-serif;padding:24px">${printContent}</body></html>`);
    w.document.close();
    w.print();
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!booking) return <div className="min-h-screen pt-20 flex items-center justify-center text-gray-400">Booking not found</div>;

  const event = booking.event;
  const qrValue = JSON.stringify({ ref: booking.bookingRef, seats: booking.seats?.map(s => s.seatNumber) });

  return (
    <PageTransition>
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400">Your tickets have been booked. Check your email for details.</p>
        </div>

        {/* E-Ticket */}
        <div id="ticket" className="relative">
          {/* Top half */}
          <div className="bg-dark-card border border-dark-border rounded-t-2xl overflow-hidden">
            {event?.image && <img src={event.image} alt={event?.title} className="w-full h-40 object-cover opacity-80" />}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Booking Reference</p>
                  <p className="text-primary font-black text-2xl font-mono tracking-wider">{booking.bookingRef}</p>
                </div>
                <span className={`badge text-sm py-1.5 px-3 ${booking.bookingStatus === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400'}`}>
                  {booking.bookingStatus?.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mb-4">{event?.title}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { icon: FiCalendar, label: 'Date', value: event?.date ? format(new Date(event.date), 'EEE, MMM d yyyy') : 'N/A' },
                  { icon: FiClock, label: 'Time', value: event?.time || 'N/A' },
                  { icon: FiMapPin, label: 'Venue', value: event?.venue?.name || 'N/A' },
                  { icon: FiUser, label: 'Attendee', value: booking.user?.name || 'You' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <p className="text-gray-500 text-xs mb-2">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seats?.map(seat => (
                    <span key={seat.seatNumber} className={`badge text-xs py-1.5 ${seat.type === 'vip' ? 'bg-yellow-500/20 text-yellow-400' : seat.type === 'premium' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-300'}`}>
                      {seat.seatNumber} ({seat.type})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider (perforated effect) */}
          <div className="flex items-center gap-1 bg-black border-l border-r border-dark-border px-2">
            <div className="w-6 h-6 rounded-full bg-black border border-dark-border -ml-5" />
            <div className="flex-1 border-t-2 border-dashed border-dark-border" />
            <div className="w-6 h-6 rounded-full bg-black border border-dark-border -mr-5" />
          </div>

          {/* Bottom half - QR */}
          <div className="bg-dark-card border border-dark-border rounded-b-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">Total Paid</p>
              <p className="text-primary font-black text-2xl">₹{booking.totalAmount?.toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-1">{booking.seats?.length} ticket(s)</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-3 rounded-xl inline-block">
                <QRCode value={qrValue} size={100} />
              </div>
              <p className="text-gray-500 text-xs mt-2">Scan at entry</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={downloadTicket} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
            <FiDownload className="w-4 h-4" /> Download Ticket
          </button>
          <Link to="/my-bookings" className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-center">
            View All Bookings
          </Link>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default BookingConfirmation;
