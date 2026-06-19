import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit3, FiSave, FiX, FiCamera, FiShield, FiBookOpen, FiHeart, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });

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

  if (!user) return null;

  return (
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

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <StatCard icon={FiBookOpen} label="Total Bookings" value="—" color="bg-blue-500/20 text-blue-400" to="/my-bookings" />
              <StatCard icon={FiHeart} label="Saved Events" value={user.favorites?.length || 0} color="bg-primary/20 text-primary" to="/wishlist" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
