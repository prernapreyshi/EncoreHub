import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiCreditCard, FiCheck, FiArrowLeft, FiClock } from 'react-icons/fi';
import { createOrder, verifyPayment, createBooking, releaseSeats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';

const HOLD_SECONDS = 5 * 60;

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);
  const bookingSucceededRef = useRef(false);

  // Release the seat hold if the user abandons checkout (back button, tab
  // close, navigating elsewhere) — but NOT if booking already went through.
  useEffect(() => {
    return () => {
      if (!bookingSucceededRef.current && state?.eventId && state?.selectedSeats?.length) {
        const seatNumbers = state.selectedSeats.map(s => s.seatNumber);
        releaseSeats(state.eventId, seatNumbers).catch(() => {});
      }
    };
  }, [state]);

  // Countdown reflecting the 5-minute server-side hold window.
  useEffect(() => {
    if (!state?.event) return;
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Your seat hold expired. Please select seats again.', { duration: 5000 });
          navigate(`/events/${state.eventId || state.event._id}/seats`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, navigate]);

  if (!state?.event || !state?.selectedSeats) {
    navigate('/events');
    return null;
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const { event, selectedSeats, totalAmount } = state;
  const baseCost = selectedSeats.reduce((s, seat) => s + seat.price, 0);
  const convenienceFee = totalAmount - baseCost;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const seatNumbers = selectedSeats.map(s => s.seatNumber);
      const { data: orderData } = await createOrder(event._id, seatNumbers);

      if (orderData.demo) {
        // Demo mode - skip actual Razorpay
        toast('Demo mode: Simulating payment...', { icon: 'ℹ️' });
        await new Promise(res => setTimeout(res, 1500));
        const { data: bookingData } = await createBooking({
          eventId: event._id,
          seats: selectedSeats,
          paymentId: 'pay_demo_' + Date.now(),
          orderId: orderData.order.id,
        });
        bookingSucceededRef.current = true;
        navigate(`/booking-confirmation/${bookingData.booking._id}`, { state: { booking: bookingData.booking } });
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Failed to load payment gateway'); setLoading(false); return; }

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'EncoreHub',
        description: event.title,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            await verifyPayment(response);
            const { data: bookingData } = await createBooking({
              eventId: event._id,
              seats: selectedSeats,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });
            bookingSucceededRef.current = true;
            toast.success('Payment successful!');
            navigate(`/booking-confirmation/${bookingData.booking._id}`, { state: { booking: bookingData.booking } });
          } catch (bookErr) {
            const isConflict = bookErr?.response?.status === 409;
            toast.error(bookErr?.response?.data?.message || 'Booking failed after payment', { duration: isConflict ? 6000 : 3500 });
            if (isConflict) setTimeout(() => navigate('/events/' + event._id + '/seats'), 2000);
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#E50914' },
        modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      const isConflict = err?.response?.status === 409;
      toast.error(err?.response?.data?.message || 'Payment failed', { duration: isConflict ? 6000 : 3500 });
      if (isConflict) setTimeout(() => navigate('/events/' + event._id + '/seats'), 2000);
      setLoading(false);
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <FiArrowLeft /> Back to Seat Selection
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-semibold ${secondsLeft <= 60 ? 'border-red-500/40 bg-red-500/10 text-red-400 animate-pulse' : 'border-dark-border bg-dark-card text-gray-300'}`}>
            <FiClock className="w-4 h-4" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-3 space-y-6">
            <h1 className="text-2xl font-black text-white">Order Summary</h1>

            {/* Event Info */}
            <div className="card p-5 flex gap-4">
              <img src={event.image} alt={event.title} className="w-24 h-20 object-cover rounded-lg hidden sm:block" />
              <div>
                <h3 className="font-bold text-white mb-1">{event.title}</h3>
                <p className="text-gray-400 text-sm">{format(new Date(event.date), 'EEE, MMM d yyyy')} · {event.time}</p>
                <p className="text-gray-400 text-sm">{event.venue?.name}, {event.city}</p>
              </div>
            </div>

            {/* Seats */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Selected Seats</h3>
              <div className="space-y-3">
                {selectedSeats.map(seat => (
                  <div key={seat.seatNumber} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded border text-xs flex items-center justify-center font-mono ${seat.type === 'vip' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : seat.type === 'premium' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-dark-border text-gray-300 bg-dark-card'}`}>
                        {seat.seatNumber}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Seat {seat.seatNumber}</p>
                        <p className="text-gray-500 text-xs capitalize">{seat.type}</p>
                      </div>
                    </div>
                    <span className="text-white font-semibold">₹{seat.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-border mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal ({selectedSeats.length} seats)</span>
                  <span>₹{baseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Convenience Fee (2%)</span>
                  <span>₹{convenienceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-dark-border">
                  <span>Total Amount</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Panel */}
          <div className="md:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-2">Payment</h2>
              <p className="text-gray-400 text-sm mb-6">Powered by Razorpay. Your data is secure.</p>

              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-xs mb-1">You'll pay</p>
                <p className="text-primary font-black text-3xl">₹{totalAmount.toLocaleString()}</p>
              </div>

              {/* Attendee info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                  </div>
                  <FiCheck className="w-4 h-4 text-green-400 ml-auto" />
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 shadow-lg shadow-primary/30"
              >
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><FiCreditCard className="w-5 h-5" /> Pay ₹{totalAmount.toLocaleString()}</>
                )}
              </button>
              <div className="flex items-center gap-2 mt-4 justify-center text-gray-500 text-xs">
                <FiLock className="w-3 h-3" /> 256-bit SSL Encrypted Payment
              </div>
              <p className="text-center text-gray-600 text-xs mt-2">
                Your seats are reserved for {minutes}:{String(seconds).padStart(2, '0')} more minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Checkout;
