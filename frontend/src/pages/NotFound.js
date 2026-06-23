import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi';
import PageTransition from '../components/common/PageTransition';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      {/* Animated background number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[28rem] font-black text-white/[0.02] leading-none">404</span>
      </div>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-16 relative">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center font-black text-white">E</div>
        <span className="text-2xl font-black text-white tracking-tight">
          Encore<span className="text-primary">Hub</span>
        </span>
      </Link>

      {/* Content */}
      <div className="relative z-10 max-w-lg">
        {/* Broken ticket illustration */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="h-20 w-36 bg-dark-card border border-dark-border rounded-l-xl flex items-center justify-center">
            <div className="text-3xl">🎟️</div>
          </div>
          <div className="flex flex-col gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1.5 h-3 bg-dark-border rounded-full" />
            ))}
          </div>
          <div className="h-20 w-36 bg-dark-card border border-dark-border rounded-r-xl flex items-center justify-center border-dashed border-l-0">
            <span className="text-gray-600 text-sm font-bold">VOID</span>
          </div>
        </div>

        <h1 className="text-5xl font-black text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-lg mb-2">
          Looks like this ticket has expired — or never existed.
        </p>
        <p className="text-gray-600 text-sm mb-10">
          The page you're looking for may have been moved, deleted, or the URL is incorrect.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 btn-secondary py-3 px-6 w-full sm:w-auto"
          >
            <FiArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 btn-primary py-3 px-6 w-full sm:w-auto shadow-lg shadow-primary/30"
          >
            <FiHome className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            to="/events"
            className="flex items-center gap-2 py-3 px-6 rounded-lg border border-dark-border text-gray-300 hover:border-primary hover:text-primary font-semibold transition-all w-full sm:w-auto"
          >
            <FiSearch className="w-4 h-4" /> Browse Events
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-12 border-t border-dark-border pt-8">
          <p className="text-gray-500 text-sm mb-4">Popular pages</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: '🎵 Concerts', to: '/events?category=Concerts' },
              { label: '⚽ Sports', to: '/events?category=Sports' },
              { label: '🎬 Movies', to: '/events?category=Movies' },
              { label: '😂 Comedy', to: '/events?category=Comedy' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-gray-400 hover:text-primary transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/20"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default NotFound;
