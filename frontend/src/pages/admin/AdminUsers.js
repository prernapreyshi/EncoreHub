import React, { useState, useEffect } from 'react';
import { FiSearch, FiShield, FiTrash2, FiUser, FiRefreshCw } from 'react-icons/fi';
import { getAllUsers, updateUserRole, deleteUser } from '../../services/api';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionId, setActionId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleRoleToggle = async (user) => {
    if (user._id === currentUser._id) { toast.error("You can't change your own role"); return; }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Make ${user.name} a ${newRole}?`)) return;
    setActionId(user._id);
    try {
      await updateUserRole(user._id, newRole);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      toast.success(`${user.name} is now a ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (user) => {
    if (user._id === currentUser._id) { toast.error("You can't delete your own account"); return; }
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
    setActionId(user._id);
    try {
      await deleteUser(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setActionId(null);
    }
  };

  const admins = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">
            {users.length} total · {admins} admin{admins !== 1 ? 's' : ''} · {regularUsers} member{regularUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={fetchUsers} className="p-2.5 rounded-lg border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 transition-all">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'border-l-blue-500', icon: '👥' },
          { label: 'Admins', value: admins, color: 'border-l-yellow-500', icon: '👑' },
          { label: 'Members', value: regularUsers, color: 'border-l-green-500', icon: '🎟' },
        ].map(s => (
          <div key={s.label} className={`card p-4 border-l-4 ${s.color}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-gray-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10 py-2.5" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-full sm:w-36 py-2.5">
          <option value="">All Roles</option>
          <option value="user">Members</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-dark-border">
              <tr>
                {['User', 'Email', 'Role', 'Joined', 'Auth', 'Favorites', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="shimmer h-4 rounded w-16" /></td>
                  ))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No users found</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user._id} className={`hover:bg-white/2 transition-colors ${user._id === currentUser._id ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{user.name}</p>
                          {user._id === currentUser._id && <span className="text-xs text-primary">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/10 text-gray-300'}`}>
                        {user.role === 'admin' ? '👑 Admin' : '🎟 Member'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${user.googleId ? 'text-blue-400' : 'text-gray-500'}`}>
                        {user.googleId ? '🔵 Google' : '📧 Email'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">{user.favorites?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRoleToggle(user)} disabled={actionId === user._id || user._id === currentUser._id}
                          className={`p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${user.role === 'admin' ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'}`}
                          title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                          {actionId === user._id ? <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" /> : <FiShield className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(user)} disabled={actionId === user._id || user._id === currentUser._id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                          <FiTrash2 className="w-4 h-4" />
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

export default AdminUsers;
