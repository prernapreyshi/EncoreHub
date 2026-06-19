import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';
import { getEvents } from '../services/api';
import EventCard from '../components/events/EventCard';

const categories = ['Movies', 'Concerts', 'Sports', 'Comedy', 'Festivals', 'Theatre', 'Other'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

const SkeletonCard = () => (
  <div className="card">
    <div className="shimmer aspect-[3/2]" />
    <div className="p-4 space-y-2">
      <div className="shimmer h-4 rounded w-3/4" />
      <div className="shimmer h-3 rounded w-1/2" />
      <div className="shimmer h-5 rounded w-1/3" />
    </div>
  </div>
);

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    date: searchParams.get('date') || '',
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await getEvents(params);
      setEvents(data.events);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', city: '', minPrice: '', maxPrice: '', date: '' });
    setSearchParams({});
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-black text-white mb-2">All Events</h1>
          <p className="text-gray-400">{total} events found</p>
        </div>

        {/* Search + Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events, venues, artists..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border font-medium transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'border-dark-border text-gray-300 hover:border-primary hover:text-primary bg-dark-card'}`}
          >
            <FiFilter className="w-4 h-4" />
            Filters {activeFiltersCount > 0 && <span className="bg-white/20 rounded-full w-5 h-5 text-xs flex items-center justify-center">{activeFiltersCount}</span>}
          </button>
          <div className="flex items-center gap-1 bg-dark-card border border-dark-border rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
              <FiGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-slide-up">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Category</label>
              <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} className="input text-sm py-2">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">City</label>
              <select value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} className="input text-sm py-2">
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Date</label>
              <input type="date" value={filters.date} onChange={e => handleFilterChange('date', e.target.value)} className="input text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Min Price (₹)</label>
              <input type="number" placeholder="0" value={filters.minPrice} onChange={e => handleFilterChange('minPrice', e.target.value)} className="input text-sm py-2" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Max Price (₹)</label>
              <input type="number" placeholder="Any" value={filters.maxPrice} onChange={e => handleFilterChange('maxPrice', e.target.value)} className="input text-sm py-2" />
            </div>
            {activeFiltersCount > 0 && (
              <div className="col-span-full">
                <button onClick={clearFilters} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                  <FiX className="w-4 h-4" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(filters).filter(([, v]) => v).map(([key, value]) => (
              <span key={key} className="flex items-center gap-1.5 badge bg-primary/15 text-primary border border-primary/30 text-sm py-1.5">
                {value}
                <button onClick={() => handleFilterChange(key, '')} className="hover:text-white">
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
              {events.map(event => <EventCard key={event._id} event={event} variant={viewMode === 'list' ? 'horizontal' : 'default'} />)}
            </div>
            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-gray-300 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all">Prev</button>
                {[...Array(pages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 rounded-lg border transition-all ${page === i + 1 ? 'bg-primary border-primary text-white' : 'bg-dark-card border-dark-border text-gray-300 hover:border-primary'}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 rounded-lg bg-dark-card border border-dark-border text-gray-300 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
