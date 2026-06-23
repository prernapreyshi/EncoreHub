import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { getEventById, getEventSeats, holdSeats, releaseSeats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import PageTransition from '../components/common/PageTransition';

const TYPE_STYLES = {
  vip:      { base: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400', hover: 'hover:bg-yellow-500/30 hover:border-yellow-400', selected: 'bg-yellow-500 border-yellow-400 text-black' },
  premium:  { base: 'bg-blue-500/10 border-blue-500/40 text-blue-400',       hover: 'hover:bg-blue-500/30 hover:border-blue-400',       selected: 'bg-blue-500 border-blue-400 text-white'  },
  standard: { base: 'bg-dark-card border-dark-border text-gray-300',          hover: 'hover:border-primary/60 hover:bg-primary/10',      selected: 'bg-primary border-primary text-white shadow-lg shadow-primary/30' },
};

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent]   = useState(null);
  const [seats, setSeats]   = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const selectedRef = useRef([]);
  const heldRef = useRef(false); // whether THIS tab successfully holds `selectedRef.current`

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  // Release any held seats if the user navigates away without completing
  // checkout (back button, tab close, switching events, etc).
  useEffect(() => {
    return () => {
      if (heldRef.current && selectedRef.current.length > 0) {
        const seatNumbers = selectedRef.current.map(s => s.seatNumber);
        releaseSeats(id, seatNumbers).catch(() => {});
      }
    };
  }, [id]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [eventRes, seatsRes] = await Promise.all([
        getEventById(id),
        getEventSeats(id),
      ]);
      setEvent(eventRes.data.event);
      setSeats(seatsRes.data.seats);
      // Clear any selected seats that have since been booked
      if (silent) {
        setSelected(prev =>
          prev.filter(s => {
            const fresh = seatsRes.data.seats.find(fs => fs.seatNumber === s.seatNumber);
            return fresh && !fresh.isBooked && !fresh.isBlocked;
          })
        );
      }
    } catch {
      toast.error('Failed to load seats');
      navigate(`/events/${id}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user, navigate, loadData]);

  const toggleSeat = (seat) => {
    if (seat.isBooked || seat.isBlocked) return;
    setSelected(prev => {
      const exists = prev.find(s => s.seatNumber === seat.seatNumber);
      if (exists) return prev.filter(s => s.seatNumber !== seat.seatNumber);
      if (prev.length >= 8) { toast.error('Maximum 8 seats per booking'); return prev; }
      return [...prev, seat];
    });
  };

  const getSeatClass = (seat) => {
    if (seat.isBooked)  return 'bg-gray-700/40 border-gray-600/50 text-gray-600 cursor-not-allowed';
    if (seat.isBlocked) return 'bg-orange-900/30 border-orange-700/40 text-orange-800 cursor-not-allowed';
    const isSelected = selected.find(s => s.seatNumber === seat.seatNumber);
    const t = TYPE_STYLES[seat.type] || TYPE_STYLES.standard;
    if (isSelected) return `${t.selected} scale-110 transition-transform`;
    return `${t.base} ${t.hover} cursor-pointer transition-all duration-150`;
  };

  const baseCost = selected.reduce((s, seat) => s + seat.price, 0);
  const convFee  = Math.round(baseCost * 0.02);
  const grandTotal = baseCost + convFee;

  const handleProceed = async () => {
    if (selected.length === 0) { toast.error('Please select at least one seat'); return; }
    setProceeding(true);
    try {
      const seatNumbers = selected.map(s => s.seatNumber);
      await holdSeats(id, seatNumbers);
      heldRef.current = true;
      navigate('/checkout', { state: { event, selectedSeats: selected, totalAmount: grandTotal, eventId: id } });
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error(err.response.data?.message || 'Some seats were just taken. Refreshing seat map…');
        await loadData(true);
      } else {
        toast.error('Could not reserve seats. Please try again.');
      }
    } finally {
      setProceeding(false);
    }
  };

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const legend = [
    { label: 'Standard', style: 'bg-dark-card border-dark-border' },
    { label: 'Premium',  style: 'bg-blue-500/20 border-blue-500/50' },
    { label: 'VIP',      style: 'bg-yellow-500/20 border-yellow-500/50' },
    { label: 'Selected', style: 'bg-primary border-primary' },
    { label: 'Booked',   style: 'bg-gray-700/40 border-gray-600 opacity-50' },
  ];

  if (loading) return (
    <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading seat map…</p>
      </div>
    </div>
  );

  return (
    <PageTransition>
    <div className="min-h-screen pt-20 pb-36 bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Event
        </button>

        {/* Event Summary */}
        {event && (
          <div className="card p-4 mb-8 flex gap-4 items-center">
            <img src={event.image} alt={event.title} className="w-20 h-14 object-cover rounded-lg hidden sm:block flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-white truncate">{event.title}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {format(new Date(event.date), 'EEE, MMM d yyyy')} · {event.time} · {event.venue?.name}
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              title="Refresh seat availability"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all flex-shrink-0"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {legend.map(({ label, style }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-300">
              <div className={`w-5 h-5 rounded border ${style}`} />
              {label}
            </div>
          ))}
        </div>

        {/* Screen / Stage */}
        <div className="mb-10 relative">
          <div className="w-3/4 mx-auto h-10 rounded-t-full bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center">
            <span className="text-xs text-gray-500 font-semibold tracking-widest uppercase">
              Stage / Screen
            </span>
          </div>
        </div>

        {/* Seat grid — horizontally scrollable on mobile */}
        <div className="overflow-x-auto pb-4">
          <div className="flex flex-col gap-2 w-max mx-auto">
            {Object.entries(rows)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([row, rowSeats]) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-6 text-center text-xs text-gray-600 font-mono flex-shrink-0">{row}</span>
                  <div className="flex gap-1.5">
                    {[...rowSeats]
                      .sort((a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1)))
                      .map(seat => (
                        <button
                          key={seat.seatNumber}
                          onClick={() => toggleSeat(seat)}
                          disabled={seat.isBooked || seat.isBlocked}
                          title={`${seat.seatNumber} · ${seat.type} · ₹${seat.price}`}
                          className={`w-8 h-8 rounded text-xs font-mono border flex-shrink-0 ${getSeatClass(seat)}`}
                        >
                          {seat.seatNumber.slice(1)}
                        </button>
                      ))
                    }
                  </div>
                  <span className="w-6 text-center text-xs text-gray-600 font-mono flex-shrink-0">{row}</span>
                </div>
              ))
            }
          </div>
          {/* Mobile scroll hint */}
          <p className="text-center text-gray-600 text-xs mt-4 sm:hidden">← Scroll to see all seats →</p>
        </div>

        {/* Seat type pricing legend */}
        <div className="flex flex-wrap gap-3 justify-center mt-6 text-xs text-gray-400">
          {event && [
            { type: 'Standard', price: event.price?.standard },
            { type: 'Premium',  price: event.price?.premium },
            { type: 'VIP',      price: event.price?.vip },
          ].filter(t => t.price > 0).map(t => (
            <span key={t.type} className="glass px-3 py-1.5 rounded-full">
              {t.type} · <span className="text-white font-semibold">₹{t.price.toLocaleString()}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-40 py-4 px-4 sm:px-6 safe-area-bottom">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            {selected.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {selected.map(s => (
                    <button
                      key={s.seatNumber}
                      onClick={() => toggleSeat(s)}
                      className="badge bg-primary/20 text-primary text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      title="Click to deselect"
                    >
                      {s.seatNumber} ×
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  {selected.length} seat(s) · ₹{baseCost.toLocaleString()} + ₹{convFee} fee
                  {' = '}<span className="text-white font-bold">₹{grandTotal.toLocaleString()}</span>
                </p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">
                Select seats to continue
                <span className="text-gray-600 ml-2">(max 8 per booking)</span>
              </p>
            )}
          </div>
          <button
            onClick={handleProceed}
            disabled={selected.length === 0 || proceeding}
            className="btn-primary py-3 px-8 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {proceeding ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reserving seats…</>
            ) : (
              <>Proceed to Pay {selected.length > 0 ? `· ₹${grandTotal.toLocaleString()}` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default SeatSelection;
