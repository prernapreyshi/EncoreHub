import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiSearch, FiPlus, FiCalendar, FiMapPin, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { getEvents, deleteEvent, updateEvent } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await getEvents(params);
      setEvents(data.events);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [search, category]); // eslint-disable-line

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const toggleFeatured = async (event) => {
    try {
      await updateEvent(event._id, { isFeatured: !event.isFeatured });
      setEvents(prev => prev.map(e => e._id === event._id ? { ...e, isFeatured: !e.isFeatured } : e));
      toast.success(`${event.title} ${event.isFeatured ? 'unfeatured' : 'featured'}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const categoryColors = {
    Movies: 'text-blue-400', Concerts: 'text-purple-400', Sports: 'text-green-400',
    Comedy: 'text-yellow-400', Festivals: 'text-orange-400', Theatre: 'text-pink-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Manage Events</h1>
          <p className="text-gray-400 text-sm mt-1">{events.length} events total</p>
        </div>
        <Link to="/admin/add-event" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 py-2.5" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input w-full sm:w-48 py-2.5">
          <option value="">All Categories</option>
          {['Movies','Concerts','Sports','Comedy','Festivals','Theatre','Other'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/3 border-b border-dark-border">
              <tr>
                {['Event', 'Category', 'Date & Venue', 'Price', 'Seats', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="shimmer h-4 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">No events found</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {event.image && (
                          <img src={event.image} alt={event.title} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1 max-w-[180px]">{event.title}</p>
                          {event.isTrending && <span className="text-xs text-orange-400">🔥 Trending</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${categoryColors[event.category] || 'text-gray-400'}`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-xs flex items-center gap-1">
                        <FiCalendar className="w-3 h-3" /> {format(new Date(event.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <FiMapPin className="w-3 h-3" /> {event.city}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-primary font-bold">₹{event.price?.standard?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${event.availableSeats < 10 ? 'text-red-400' : 'text-green-400'}`}>
                        {event.availableSeats || 0}/{event.totalSeats}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleFeatured(event)} className={`transition-colors ${event.isFeatured ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}>
                        {event.isFeatured ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/edit-event/${event._id}`}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all">
                          <FiEdit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(event._id, event.title)} disabled={deleting === event._id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50">
                          {deleting === event._id
                            ? <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <FiTrash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
