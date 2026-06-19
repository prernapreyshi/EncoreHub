import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiMapPin, FiStar } from 'react-icons/fi';

const HeroBanner = ({ events }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const next = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % events.length);
      setIsAnimating(false);
    }, 300);
  }, [events.length, isAnimating]);

  const prev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c - 1 + events.length) % events.length);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (!events?.length) return null;
  const event = events[current];

  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={event.image || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative z-10 h-full flex items-center transition-all duration-500 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="badge bg-primary text-white">{event.category}</span>
              {event.language && <span className="badge bg-white/10 text-gray-300">{event.language}</span>}
              {event.rating > 0 && (
                <span className="flex items-center gap-1 badge bg-yellow-500/20 text-yellow-400">
                  <FiStar className="w-3 h-3 fill-current" />{event.rating}
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">{event.title}</h1>
            <p className="text-gray-300 text-lg mb-6 line-clamp-2 max-w-xl">{event.description}</p>
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <FiCalendar className="text-primary" />
                {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {event.time}
              </span>
              <span className="flex items-center gap-2">
                <FiMapPin className="text-primary" />
                {event.venue?.name}, {event.city}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to={`/events/${event._id}`} className="btn-primary text-base py-3 px-8 shadow-lg shadow-primary/30">
                Book Now · ₹{event.price?.standard?.toLocaleString()} onwards
              </Link>
              <Link to="/events" className="btn-secondary py-3 px-6">
                Explore All
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 glass rounded-full hover:bg-white/20 transition-all">
        <FiChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 glass rounded-full hover:bg-white/20 transition-all">
        <FiChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {events.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
