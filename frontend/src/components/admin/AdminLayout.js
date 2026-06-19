import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-dark-card border-b border-dark-border flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-gray-400 text-sm">Welcome back, <span className="text-white font-semibold">{user?.name}</span></p>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all relative">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
