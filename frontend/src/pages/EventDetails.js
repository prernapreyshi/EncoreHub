import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiStar, FiHeart, FiShare2, FiTag, FiArrowLeft } from 'react-icons/fi';
import { getEventById, toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isFavorite = user?.favorites?.some(f => (f._id || f) === id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await getEventById(id);
        setEvent(data.event);
      } catch (err) {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleFavorite = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      const { data } = await toggleFavorite(id);
      updateUser({ ...user, favorites: data.favorites });
      toast.success(isFavorite ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="shimmer h-[50vh] w-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="shimmer h-8 rounded w-3/4" />
            <div className="shimmer h-4 rounded w-1/2" />
            <div className="shimmer h-32 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const priceList = [
    { type: 'Standard', price: event.price?.standard, color: 'text-green-400' },
    { type: 'Premium', price: event.price?.premium, color: 'text-blue-400' },
    { type: 'VIP', price: event.price?.vip, color: 'text-yellow-400' },
  ].filter(p => p.price > 0);

  return (
    <PageTransition>
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>{event.title} — EncoreHub</title>
        <meta name="description" content={event.description?.slice(0, 155) || `Book tickets for ${event.title} on EncoreHub.`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${event.title} — EncoreHub`} />
        <meta property="og:description" content={event.description?.slice(0, 200) || `Book tickets for ${event.title} on EncoreHub.`} />
        {event.image && <meta property="og:image" content={event.image} />}
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${event.title} — EncoreHub`} />
        <meta name="twitter:description" content={event.description?.slice(0, 200) || `Book tickets for ${event.title} on EncoreHub.`} />
        {event.image && <meta name="twitter:image" content={event.image} />}
      </Helmet>
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] overflow-hidden bg-dark-card">
        {/* Shimmer shown while the image is still downloading */}
        {!imgLoaded && <div className="absolute inset-0 shimmer" />}
        <img
          src={event.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600'}
          alt={event.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute top-20 left-4 sm:left-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 glass px-4 py-2 rounded-xl text-white text-sm hover:bg-white/20 transition-all">
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="absolute bottom-8 left-4 sm:left-6 right-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="badge bg-primary text-white">{event.category}</span>
            {event.language && <span className="badge bg-white/20 text-white">{event.language}</span>}
            {event.ageRating && <span className="badge bg-white/10 text-white border border-white/20">{event.ageRating}</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white max-w-3xl">{event.title}</h1>
          {event.rating > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`w-4 h-4 ${i < Math.floor(event.rating) ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
              ))}
              <span className="text-white font-semibold">{event.rating}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: FiCalendar, label: 'Date', value: format(new Date(event.date), 'MMM d, yyyy'), color: 'text-blue-400' },
                { icon: FiClock, label: 'Time', value: event.time, color: 'text-green-400' },
                { icon: FiMapPin, label: 'City', value: event.city, color: 'text-orange-400' },
                { icon: FiUsers, label: 'Seats Left', value: event.availableSeats, color: event.availableSeats < 20 ? 'text-red-400' : 'text-emerald-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
                  <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="text-white font-semibold text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">About this Event</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
              {event.artists?.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Featured Artists</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.artists.map(artist => (
                      <span key={artist} className="badge bg-purple-500/20 text-purple-400 border border-purple-500/20">{artist}</span>
                    ))}
                  </div>
                </div>
              )}
              {event.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 rounded-full px-3 py-1">
                      <FiTag className="w-3 h-3" />#{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Venue */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Venue</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{event.venue?.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{event.venue?.address}</p>
                  {event.venue?.mapLink && (
                    <a href={event.venue.mapLink} target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-2 inline-block hover:underline">
                      View on Map →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-20">
              <h2 className="text-lg font-bold text-white mb-4">Book Tickets</h2>
              {/* Pricing */}
              <div className="space-y-3 mb-6">
                {priceList.map(({ type, price, color }) => (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                    <div>
                      <p className="text-white font-medium text-sm">{type}</p>
                      <p className="text-gray-500 text-xs">Category Seats</p>
                    </div>
                    <span className={`font-bold text-lg ${color}`}>₹{price?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {event.availableSeats > 0 ? (
                <Link to={`/events/${event._id}/seats`} className="btn-primary w-full text-center block text-base py-3 shadow-lg shadow-primary/30">
                  Select Seats
                </Link>
              ) : (
                <button className="w-full py-3 rounded-lg bg-gray-700 text-gray-400 font-semibold cursor-not-allowed" disabled>
                  Sold Out
                </button>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={handleFavorite} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-medium text-sm transition-all ${isFavorite ? 'border-primary bg-primary/10 text-primary' : 'border-dark-border text-gray-300 hover:border-primary hover:text-primary'}`}>
                  <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> {isFavorite ? 'Saved' : 'Wishlist'}
                </button>
                <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dark-border text-gray-300 hover:border-primary hover:text-primary font-medium text-sm transition-all">
                  <FiShare2 className="w-4 h-4" /> Share
                </button>
              </div>
              <div className="mt-4 bg-white/5 rounded-lg p-3 text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-1">📌 Note</p>
                <p>All prices are per person inclusive of applicable taxes. Seats are subject to availability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default EventDetails;
