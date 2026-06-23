import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp, FiArrowRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getAnalytics, getAllBookings } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition';

const StatCard = ({ icon: Icon, label, value, change, color, bg }) => (
  <div className={`card p-5 border-l-4 ${color}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      {change !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-black text-white mb-1">{value}</p>
    <p className="text-gray-400 text-sm">{label}</p>
  </div>
);

const AdminOverview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getAllBookings()])
      .then(([analyticsRes, bookingsRes]) => {
        setAnalytics(analyticsRes.data.analytics);
        setRecentBookings(bookingsRes.data.bookings.slice(0, 8));
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-32 rounded-xl" />)}
      </div>
    </div>
  );

  const stats = [
    { icon: FiCalendar, label: 'Total Events', value: analytics?.totalEvents || 0, color: 'border-blue-500', bg: 'bg-blue-500/20 text-blue-400', change: 12 },
    { icon: FiUsers, label: 'Total Users', value: (analytics?.totalUsers || 0).toLocaleString(), color: 'border-purple-500', bg: 'bg-purple-500/20 text-purple-400', change: 8 },
    { icon: FiBookOpen, label: 'Total Bookings', value: (analytics?.totalBookings || 0).toLocaleString(), color: 'border-green-500', bg: 'bg-green-500/20 text-green-400', change: 15 },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${((analytics?.totalRevenue || 0) / 1000).toFixed(0)}K`, color: 'border-primary', bg: 'bg-primary/20 text-primary', change: 22 },
  ];

  return (
    <PageTransition>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard Overview</h1>
          <p className="text-gray-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <Link to="/admin/add-event" className="btn-primary py-2.5 px-5 text-sm">+ Add Event</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-primary text-sm hover:text-primary-light flex items-center gap-1">
              View all <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-border text-left">
                  <th className="pb-3 font-medium text-gray-400">Booking</th>
                  <th className="pb-3 font-medium text-gray-400 hidden sm:table-cell">Event</th>
                  <th className="pb-3 font-medium text-gray-400">Amount</th>
                  <th className="pb-3 font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {recentBookings.map(b => (
                  <tr key={b._id} className="hover:bg-white/2">
                    <td className="py-3">
                      <p className="text-white font-medium font-mono text-xs">{b.bookingRef}</p>
                      <p className="text-gray-500 text-xs">{b.user?.name}</p>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      <p className="text-gray-300 text-xs line-clamp-1 max-w-[150px]">{b.event?.title}</p>
                    </td>
                    <td className="py-3">
                      <span className="text-primary font-bold">₹{b.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="py-3">
                      <span className={`badge text-xs ${b.bookingStatus === 'confirmed' ? 'bg-green-500/20 text-green-400' : b.bookingStatus === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentBookings.length === 0 && (
              <p className="text-center text-gray-500 py-8">No bookings yet</p>
            )}
          </div>
        </div>

        {/* Top Events + Category Breakdown */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-bold text-white mb-4">Top Events</h2>
            <div className="space-y-3">
              {(analytics?.topEvents || []).map((event, i) => (
                <div key={event._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{event.title}</p>
                    <p className="text-gray-500 text-xs">{event.totalBookings} bookings</p>
                  </div>
                  <span className="text-primary text-xs font-bold flex-shrink-0">
                    ₹{((event.totalRevenue || 0) / 1000).toFixed(0)}K
                  </span>
                </div>
              ))}
              {(!analytics?.topEvents || analytics.topEvents.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-white mb-4">By Category</h2>
            <div className="space-y-2">
              {(analytics?.categoryStats || []).map(cat => (
                <div key={cat._id} className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm flex-1 truncate">{cat._id}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(cat.count / (analytics?.totalEvents || 1)) * 100}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs w-5 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue trend hint */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <FiTrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="text-white font-semibold">Revenue this month</p>
          <p className="text-gray-400 text-sm">Visit the <Link to="/admin/analytics" className="text-primary hover:underline">Analytics page</Link> for detailed charts and revenue breakdown.</p>
        </div>
        <Link to="/admin/analytics" className="ml-auto btn-secondary py-2 px-4 text-sm whitespace-nowrap">View Analytics</Link>
      </div>
    </div>
    </PageTransition>
  );
};

export default AdminOverview;
