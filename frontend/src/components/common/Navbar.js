import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiMenu, FiX, FiHeart, FiUser, FiLogOut, FiSettings, FiBookOpen } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setProfileOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const categories = ['Movies', 'Concerts', 'Sports', 'Comedy', 'Festivals'];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white text-sm">E</div>
            <span className="text-xl font-black text-white tracking-tight">
              Encore<span className="text-primary">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 mx-6">
            {categories.map(cat => (
              <Link key={cat} to={`/events?category=${cat}`} className="text-gray-300 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                {cat}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events, cities..."
                className="w-full bg-white/10 text-white placeholder-gray-400 pl-9 pr-4 py-2 rounded-xl text-sm border border-white/10 focus:outline-none focus:border-primary/60 focus:bg-white/15 transition-all"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-white/10 transition-all">
                  <FiHeart className="w-5 h-5" />
                </Link>
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-white max-w-[100px] truncate">{user.name}</span>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-dark-border rounded-xl shadow-xl shadow-black/50 py-2 animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-dark-border">
                        <p className="font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {isAdmin && <span className="badge bg-primary/20 text-primary mt-1 inline-block">Admin</span>}
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <FiUser className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <FiBookOpen className="w-4 h-4" /> My Bookings
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                        <FiHeart className="w-4 h-4" /> Wishlist
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                          <FiSettings className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}
                      <div className="border-t border-dark-border mt-2 pt-2">
                        <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 w-full transition-colors">
                          <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition-all">
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 animate-slide-up">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="input pl-9"
                />
              </div>
            </form>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <Link key={cat} to={`/events?category=${cat}`} className="text-center text-sm font-medium py-2 px-3 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
