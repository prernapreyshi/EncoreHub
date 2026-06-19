import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
import { getEventById, getEventSeats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchData = async () => {
      try {
        const [eventRes, seatsRes] = await Promise.all([getEventById(id), getEventSeats(id)]);
        setEvent(eventRes.data.event);
        setSeats(seatsRes.data.seats);
      } catch { toast.error('Failed to load seats'); navigate(`/events/${id}`); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, user, navigate]);

  const toggleSeat = (seat) => {
    if (seat.isBooked || seat.isBlocked) return;
    setSelected(prev => {
      const exists = prev.find(s => s.seatNumber === seat.seatNumber);
      if (exists) return prev.filter(s => s.seatNumber !== seat.seatNumber);
      if (prev.length >= 8) { toast.error('Max 8 seats per booking'); return prev; }
      return [...prev, seat];
    });
  };

  const totalAmount = selected.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = Math.round(totalAmount * 0.02);
  const grandTotal = totalAmount + convenienceFee;

  const handleProceed = () => {
    if (selected.length === 0) { toast.error('Please select at least one seat'); return; }
    navigate('/checkout', { state: { event, selectedSeats: selected, totalAmount: grandTotal } });
  };

  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const getSeatStyle = (seat) => {
    const isSelected = selected.find(s => s.seatNumber === seat.seatNumber);
    if (isSelected) return 'bg-primary border-primary text-white shadow-lg shadow-primary/40 scale-110';
    if (seat.isBooked) return 'bg-gray-700/50 border-gray-600 cursor-not-allowed opacity-50';
    if (seat.isBlocked) return 'bg-orange-900/50 border-orange-700 cursor-not-allowed opacity-50';
    if (seat.type === 'vip') return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 hover:border-yellow-400';
    if (seat.type === 'premium') return 'bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/30 hover:border-blue-400';
    return 'bg-dark-card border-dark-border text-gray-300 hover:border-primary/60 hover:bg-primary/10';
  };

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <FiArrowLeft className="w-5 h-5" /> Back to Event
        </button>

        {/* Event Summary */}
        {event && (
          <div className="card p-4 mb-8 flex gap-4 items-center">
            <img src={event.image} alt={event.title} className="w-20 h-16 object-cover rounded-lg hidden sm:block" />
            <div>
              <h1 className="font-bold text-white text-lg">{event.title}</h1>
              <p className="text-gray-400 text-sm">{format(new Date(event.date), 'EEE, MMM d yyyy')} · {event.time} · {event.venue?.name}</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {[
            { color: 'bg-dark-card border-dark-border', label: 'Standard' },
            { color: 'bg-blue-500/10 border-blue-500/50', label: 'Premium' },
            { color: 'bg-yellow-500/10 border-yellow-500/50', label: 'VIP' },
            { color: 'bg-primary border-primary', label: 'Selected' },
            { color: 'bg-gray-700/50 border-gray-600 opacity-50', label: 'Booked' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-300">
              <div className={`w-5 h-5 rounded border ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* Stage */}
        <div className="relative mb-10">
          <div className="w-4/5 mx-auto h-10 bg-gradient-to-b from-white/10 to-transparent rounded-t-full flex items-center justify-center">
            <span className="text-xs text-gray-400 font-semibold tracking-widest uppercase">Stage / Screen</span>
          </div>
        </div>

        {/* Seats */}
        <div className="space-y-2 overflow-x-auto pb-4">
          {Object.entries(rows).sort(([a], [b]) => a.localeCompare(b)).map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2 min-w-max mx-auto" style={{ width: 'fit-content' }}>
              <span className="w-6 text-center text-gray-500 text-xs font-mono">{row}</span>
              <div className="flex gap-1.5">
                {rowSeats.sort((a, b) => parseInt(a.seatNumber.slice(1)) - parseInt(b.seatNumber.slice(1))).map(seat => (
                  <button
                    key={seat.seatNumber}
                    onClick={() => toggleSeat(seat)}
                    disabled={seat.isBooked || seat.isBlocked}
                    className={`w-8 h-8 rounded border text-xs font-mono transition-all duration-150 ${getSeatStyle(seat)}`}
                    title={`${seat.seatNumber} - ${seat.type} - ₹${seat.price}`}
                  >
                    {seat.seatNumber.slice(1)}
                  </button>
                ))}
              </div>
              <span className="w-6 text-center text-gray-500 text-xs font-mono">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border z-40 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {selected.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selected.map(s => (
                    <span key={s.seatNumber} className="badge bg-primary/20 text-primary text-xs">{s.seatNumber}</span>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  {selected.length} seat(s) · ₹{totalAmount.toLocaleString()} + ₹{convenienceFee} fee = <span className="text-white font-bold text-base">₹{grandTotal.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Select seats to continue (max 8 per booking)</p>
            )}
          </div>
          <button onClick={handleProceed} disabled={selected.length === 0} className="btn-primary py-3 px-8 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
            Proceed to Pay {selected.length > 0 ? `· ₹${grandTotal.toLocaleString()}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
