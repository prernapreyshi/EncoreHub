import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiHeart, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { toggleFavorite } from '../../services/api';
import toast from 'react-hot-toast';

const categoryColors = {
  Movies: 'bg-blue-500/20 text-blue-400',
  Concerts: 'bg-purple-500/20 text-purple-400',
  Sports: 'bg-green-500/20 text-green-400',
  Comedy: 'bg-yellow-500/20 text-yellow-400',
  Festivals: 'bg-orange-500/20 text-orange-400',
  Theatre: 'bg-pink-500/20 text-pink-400',
  Other: 'bg-gray-500/20 text-gray-400',
};

const EventCard = ({ event, variant = 'default', onWishlistUpdate }) => {
  const { user, updateUser } = useAuth();
  const [imgLoaded, setImgLoaded] = useState(false);
  const isFavorite = user?.favorites?.some(f => (f._id || f) === event._id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add favorites'); return; }
    try {
      const { data } = await toggleFavorite(event._id);
      updateUser({ ...user, favorites: data.favorites });
      toast.success(isFavorite ? 'Removed from wishlist' : 'Added to wishlist');
      if (onWishlistUpdate) onWishlistUpdate();
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const price = event.price?.standard || 0;
  const colorClass = categoryColors[event.category] || categoryColors.Other;

  if (variant === 'horizontal') {
    return (
      <Link to={`/events/${event._id}`} className="card flex gap-4 p-4 hover:shadow-xl hover:shadow-primary/10 group">
        <img src={event.image || '/placeholder.jpg'} alt={event.title} className="w-28 h-24 sm:w-36 sm:h-28 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className={`badge ${colorClass} text-xs`}>{event.category}</span>
            <button onClick={handleFavorite} className={`p-1.5 rounded-lg transition-colors ${isFavorite ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
              <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
          <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 mb-2">{event.title}</h3>
          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{format(new Date(event.date), 'MMM d, yyyy')}</span>
            <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{event.city}</span>
          </div>
          <p className="text-primary font-bold mt-2 text-sm">₹{price.toLocaleString()}<span className="text-gray-500 font-normal"> onwards</span></p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/events/${event._id}`} className="card group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 block">
      <div className="relative overflow-hidden aspect-[3/2] bg-dark-card">
        {!imgLoaded && <div className="absolute inset-0 shimmer" />}
        <img
          src={event.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400'}
          alt={event.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className="absolute inset-0 overlay" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${colorClass} text-xs`}>{event.category}</span>
          {event.isFeatured && <span className="badge bg-primary/20 text-primary text-xs">Featured</span>}
        </div>
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full glass transition-all ${isFavorite ? 'text-primary' : 'text-white hover:text-primary'}`}
        >
          <FiHeart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {event.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 glass rounded-full px-2 py-1 text-xs">
            <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white font-medium">{event.rating}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiCalendar className="w-3 h-3 text-primary flex-shrink-0" />
            <span>{format(new Date(event.date), 'EEE, MMM d • h:mm a')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FiMapPin className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="truncate">{event.venue?.name}, {event.city}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary font-bold text-base">₹{price.toLocaleString()}</span>
            <span className="text-gray-500 text-xs ml-1">onwards</span>
          </div>
          <span className={`text-xs font-medium ${event.availableSeats < 20 ? 'text-orange-400' : 'text-green-400'}`}>
            {event.availableSeats < 20 ? `${event.availableSeats} left` : 'Available'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
