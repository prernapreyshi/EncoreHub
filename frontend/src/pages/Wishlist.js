import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import { getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/events/EventCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { user, updateUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(({ data }) => {
        setFavorites(data.user.favorites || []);
        updateUser(data.user);
      })
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleWishlistUpdate = () => {
    // Re-fetch to get updated favorites
    getProfile().then(({ data }) => {
      setFavorites(data.user.favorites || []);
      updateUser(data.user);
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <FiHeart className="w-8 h-8 text-primary fill-current" /> My Wishlist
            </h1>
            <p className="text-gray-400 mt-1">
              {loading ? '...' : `${favorites.length} saved event${favorites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link to="/events" className="flex items-center gap-2 text-primary hover:text-primary-light font-medium text-sm transition-colors">
            Discover more <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card">
                <div className="shimmer aspect-[3/2]" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                  <div className="shimmer h-5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-12 h-12 text-primary/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Your wishlist is empty</h3>
            <p className="text-gray-400 max-w-sm mx-auto mb-8">
              Start saving events you love! Tap the heart icon on any event to add it here.
            </p>
            <Link to="/events" className="btn-primary inline-block px-8 py-3 shadow-lg shadow-primary/30">
              Explore Events
            </Link>
          </div>
        ) : (
          <>
            {/* Quick actions bar */}
            <div className="flex items-center justify-between mb-6 bg-dark-card border border-dark-border rounded-xl px-4 py-3">
              <span className="text-gray-400 text-sm">
                {favorites.length} event{favorites.length !== 1 ? 's' : ''} saved
              </span>
              <div className="flex gap-2">
                <span className="text-xs text-gray-500">Click ♥ on any card to remove</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map(event => (
                <EventCard
                  key={event._id}
                  event={event}
                  onWishlistUpdate={handleWishlistUpdate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
