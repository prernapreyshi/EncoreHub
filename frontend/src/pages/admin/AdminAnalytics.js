import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiBookOpen, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { getAnalytics } from '../../services/api';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const BarChart = ({ data, height = 120 }) => {
  if (!data?.length) return <div className="h-32 flex items-center justify-center text-gray-500 text-sm">No data available</div>;
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full">
            <div
              className="w-full bg-primary/30 rounded-t hover:bg-primary/60 transition-all cursor-default"
              style={{ height: `${max > 0 ? (d.revenue / max) * (height - 30) : 0}px`, minHeight: d.revenue > 0 ? '4px' : '0' }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-dark-card border border-dark-border rounded px-1.5 py-0.5 whitespace-nowrap z-10">
              ₹{(d.revenue / 1000).toFixed(0)}K
            </div>
          </div>
          <span className="text-gray-500 text-xs">{MONTHS[(d._id?.month || 1) - 1]}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ data, total }) => {
  const colors = ['#E50914','#8B5CF6','#10B981','#F59E0B','#3B82F6','#EC4899','#6B7280'];
  let offset = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#1f1f1f" strokeWidth="18" />
          {data.map((d, i) => {
            const pct = total > 0 ? d.count / total : 0;
            const dash = pct * circumference;
            const gap = circumference - dash;
            const seg = (
              <circle key={i} cx="70" cy="70" r={radius} fill="none"
                stroke={colors[i % colors.length]} strokeWidth="18"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset * circumference}
              />
            );
            offset += pct;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white font-black text-xl">{total}</p>
            <p className="text-gray-400 text-xs">Events</p>
          </div>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-gray-300 text-xs flex-1 truncate">{d._id}</span>
            <span className="text-white text-xs font-semibold">{d.count}</span>
            <span className="text-gray-500 text-xs">({total > 0 ? Math.round((d.count/total)*100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await getAnalytics();
      setAnalytics(data.analytics);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-28 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-64 rounded-xl" />)}
      </div>
    </div>
  );

  const kpis = [
    { icon: FiCalendar, label: 'Total Events', value: analytics?.totalEvents || 0, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { icon: '👥', label: 'Total Users', value: (analytics?.totalUsers || 0).toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { icon: FiBookOpen, label: 'Paid Bookings', value: (analytics?.totalBookings || 0).toLocaleString(), color: 'text-green-400', bg: 'bg-green-500/20' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${((analytics?.totalRevenue || 0) / 100000).toFixed(1)}L`, color: 'text-primary', bg: 'bg-primary/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Platform performance overview</p>
        </div>
        <button onClick={fetchAnalytics} className="p-2.5 rounded-lg border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 transition-all">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              {typeof Icon === 'string' ? <span>{Icon}</span> : <Icon className={`w-5 h-5 ${color}`} />}
            </div>
            <p className="text-2xl font-black text-white mb-1">{value}</p>
            <p className="text-gray-400 text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white">Monthly Revenue</h2>
              <p className="text-gray-500 text-xs mt-1">Last 12 months</p>
            </div>
            <FiTrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <BarChart data={analytics?.monthlyRevenue || []} height={150} />
        </div>

        {/* Category Breakdown */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-white">Events by Category</h2>
              <p className="text-gray-500 text-xs mt-1">Distribution across categories</p>
            </div>
          </div>
          <DonutChart data={analytics?.categoryStats || []} total={analytics?.totalEvents || 0} />
        </div>

        {/* Top Performing Events */}
        <div className="card p-5">
          <h2 className="font-bold text-white mb-5">Top Events by Revenue</h2>
          <div className="space-y-4">
            {(analytics?.topEvents || []).map((event, i) => {
              const maxRev = analytics?.topEvents?.[0]?.totalRevenue || 1;
              const pct = maxRev > 0 ? (event.totalRevenue / maxRev) * 100 : 0;
              return (
                <div key={event._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-5 h-5 rounded bg-primary/20 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>
                      <span className="text-white text-sm truncate">{event.title}</span>
                    </div>
                    <span className="text-primary font-bold text-sm ml-3 flex-shrink-0">₹{((event.totalRevenue || 0)/1000).toFixed(0)}K</span>
                  </div>
                  <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{event.totalBookings || 0} bookings · {event.category}</p>
                </div>
              );
            })}
            {(!analytics?.topEvents?.length) && (
              <p className="text-center text-gray-500 py-6">No revenue data yet</p>
            )}
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="card p-5">
          <h2 className="font-bold text-white mb-5">Monthly Bookings</h2>
          {(analytics?.monthlyRevenue || []).length > 0 ? (
            <div className="space-y-3">
              {analytics.monthlyRevenue.slice(-6).reverse().map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-8">{MONTHS[(m._id?.month || 1) - 1]}</span>
                  <div className="flex-1 h-2 bg-dark-border rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/60 rounded-full"
                      style={{ width: `${Math.min((m.bookings / Math.max(...analytics.monthlyRevenue.map(r => r.bookings))) * 100, 100)}%` }} />
                  </div>
                  <span className="text-white text-xs font-semibold w-8 text-right">{m.bookings}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-6">No booking data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
