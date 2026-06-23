import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit3, FiSave, FiX, FiCamera, FiShield, FiBookOpen, FiHeart, FiCalendar, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, getUserBookings } from '../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-black text-white group-hover:text-primary transition-colors">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  </Link>
);

const Profile = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingCount, setBookingCount] = useState('—');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });

  const [pwEditing, setPwEditing] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    // Request page 1 with limit 1 — we only need `data.total`, the aggregate
    // count from the server, not an actual list of bookings. This avoids
    // loading all bookings just to count them, and works correctly regardless
    // of how many bookings the user has.
    getUserBookings({ page: 1, limit: 1 })
      .then(({ data }) => setBookingCount(data.total ?? data.bookings?.length ?? '—'))
      .catch(() => {/* silent — count stays as — */});
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm;
    if (!user?.googleId && !currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (!/\d/.test(newPassword)) { toast.error('New password must contain at least one number'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setPwLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handlePwCancel = () => {
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPwEditing(false);
  };

  if (!user) return null;

  return (
    <PageTransition>
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-black text-white mb-8">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Avatar & Quick Info */}
          <div className="md:col-span-1">
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-primary/30 mx-auto" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-black text-4xl mx-auto border-4 border-primary/30">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {editing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-black hover:bg-primary-dark transition-colors">
                    <FiCamera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-gray-400 text-sm mb-3">{user.email}</p>
              <div className="flex items-center justify-center gap-2">
                <span className={`badge ${isAdmin ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                  {isAdmin ? '👑 Admin' : '🎟 Member'}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-dark-border text-left">
                <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-1">
                  <FiCalendar className="w-3 h-3" /> Member since {format(new Date(user.createdAt || Date.now()), 'MMM yyyy')}
                </p>
                {user.googleId && (
                  <p className="text-gray-500 text-xs flex items-center gap-1.5">
                    <FiShield className="w-3 h-3 text-green-400" /> Google verified
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details & Edit */}
          <div className="md:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Personal Information</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary-light font-medium transition-colors">
                    <FiEdit3 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-dark-border hover:border-gray-500 transition-all">
                      <FiX className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-1.5 text-sm btn-primary py-1.5 px-4">
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave className="w-4 h-4" /> Save</>}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  {editing ? (
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="input pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium flex items-center gap-2">
                      <FiUser className="w-4 h-4 text-gray-500" /> {user.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                  <p className="text-white font-medium flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-gray-500" /> {user.email}
                    <span className="badge bg-green-500/20 text-green-400 text-xs ml-1">Verified</span>
                  </p>
                  {editing && <p className="text-gray-500 text-xs mt-1">Email cannot be changed.</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  {editing ? (
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        className="input pl-10"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  ) : (
                    <p className="text-white font-medium flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-500" />
                      {user.phone || <span className="text-gray-500 italic">Not added</span>}
                    </p>
                  )}
                </div>

                {editing && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Avatar URL</label>
                    <input
                      type="url"
                      value={form.avatar}
                      onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))}
                      className="input"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="card p-6 mt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FiLock className="w-4 h-4 text-gray-500" /> Password & Security
                </h2>
                {!pwEditing ? (
                  <button onClick={() => setPwEditing(true)} className="flex items-center gap-2 text-sm text-primary hover:text-primary-light font-medium transition-colors">
                    <FiEdit3 className="w-4 h-4" /> Change Password
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handlePwCancel} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-dark-border hover:border-gray-500 transition-all">
                      <FiX className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleChangePassword} disabled={pwLoading} className="flex items-center gap-1.5 text-sm btn-primary py-1.5 px-4">
                      {pwLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave className="w-4 h-4" /> Update</>}
                    </button>
                  </div>
                )}
              </div>

              {!pwEditing ? (
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="tracking-widest">••••••••</span>
                  {user.googleId && <span className="badge bg-blue-500/20 text-blue-400 text-xs">Google sign-in</span>}
                </p>
              ) : (
                <div className="space-y-4">
                  {!user.googleId && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type={showPw.current ? 'text' : 'password'}
                          value={pwForm.currentPassword}
                          onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                          className="input pl-10 pr-10"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                          {showPw.current ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPw.next ? 'text' : 'password'}
                        value={pwForm.newPassword}
                        onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="input pl-10 pr-10"
                        placeholder="At least 6 characters, 1 number"
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, next: !p.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                        {showPw.next ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="input pl-10 pr-10"
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                        {showPw.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <StatCard icon={FiBookOpen} label="Total Bookings" value={bookingCount} color="bg-blue-500/20 text-blue-400" to="/my-bookings" />
              <StatCard icon={FiHeart} label="Saved Events" value={user.favorites?.length || 0} color="bg-primary/20 text-primary" to="/wishlist" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Profile;
