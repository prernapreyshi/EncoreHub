import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { getAllBookings } from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition';

const statusConfig = {
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const paymentConfig = {
  paid: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const PAGE_SIZE = 20;

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = async (pageNum = 1, append = false) => {
    const setBusy = append ? setLoadingMore : setLoading;
    setBusy(true);
    try {
      const { data } = await getAllBookings({
        page: pageNum,
        limit: PAGE_SIZE,
        ...(statusFilter && { status: statusFilter }),
      });
      setBookings(prev => (append ? [...prev, ...data.bookings] : data.bookings));
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
      setPage(pageNum);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setBusy(false);
    }
  };

  // Status filter changes go through the server; re-fetch from page 1.
  useEffect(() => { fetchBookings(1, false); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    if (page < totalPages) fetchBookings(page + 1, true);
  };

  // Search filters within whatever's currently loaded — fast, client-side,
  // and doesn't require a server round trip on every keystroke. For a full
  // cross-dataset search, narrowing by status first keeps result sets small.
  const filtered = bookings.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.bookingRef?.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.event?.title?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = filtered.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.totalAmount || 0), 0);

  const exportCSV = () => {
    const rows = [
      ['Booking Ref', 'User', 'Email', 'Event', 'Seats', 'Amount', 'Status', 'Payment', 'Date'],
      ...filtered.map(b => [
        b.bookingRef, b.user?.name, b.user?.email, b.event?.title,
        b.seats?.map(s => s.seatNumber).join('|'), b.totalAmount,
        b.bookingStatus, b.paymentStatus, format(new Date(b.createdAt), 'yyyy-MM-dd')
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click();
    toast.success(
      bookings.length < total
        ? `CSV exported (${filtered.length} of ${total} total — load more to include the rest)`
        : 'CSV exported'
    );
  };

  return (

    <PageTransition>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">
            {bookings.length} of {total} loaded · Revenue (loaded): <span className="text-primary font-bold">₹{totalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchBookings(1, false)} className="p-2.5 rounded-lg border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 transition-all">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 py-2.5 px-4 rounded-lg border border-dark-border text-gray-300 hover:border-primary hover:text-primary text-sm font-medium transition-all">
            <FiDownload className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search by ref, user, or event..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 py-2.5" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-full sm:w-44 py-2.5">
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-border">
              <tr>
                {['Booking Ref', 'Customer', 'Event', 'Seats', 'Amount', 'Status', 'Payment', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="shimmer h-4 rounded w-16" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No bookings found</td></tr>
              ) : (
                filtered.map(b => (
                  <tr key={b._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-primary font-bold">{b.bookingRef}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{b.user?.name}</p>
                      <p className="text-gray-500 text-xs">{b.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-xs line-clamp-1 max-w-[140px]">{b.event?.title}</p>
                      {b.event?.date && (
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                          <FiCalendar className="w-3 h-3" />
                          {format(new Date(b.event.date), 'MMM d')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {b.seats?.slice(0, 3).map(s => (
                          <span key={s.seatNumber} className="badge bg-white/10 text-gray-300 text-xs py-0.5">{s.seatNumber}</span>
                        ))}
                        {b.seats?.length > 3 && <span className="text-gray-500 text-xs">+{b.seats.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-primary font-bold">₹{b.totalAmount?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs border ${statusConfig[b.bookingStatus] || statusConfig.pending}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs border ${paymentConfig[b.paymentStatus] || paymentConfig.pending}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">{format(new Date(b.createdAt), 'MMM d, yyyy')}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && page < totalPages && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn-secondary px-8 py-2.5 inline-flex items-center gap-2 disabled:opacity-50"
          >
            {loadingMore && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
            {loadingMore ? 'Loading…' : `Load More (${total - bookings.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  
    </PageTransition>
  );
};

export default AdminBookings;
