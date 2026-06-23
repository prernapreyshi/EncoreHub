import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginAPI,
  register as registerAPI,
  googleLogin as googleLoginAPI,
  logout as logoutAPI,
  getMe,
} from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The JWT itself now lives in an httpOnly cookie the browser sends
  // automatically (see services/api.js — withCredentials: true) — there's no
  // token in localStorage or in this context for client JS to read or leak.
  // To find out whether the user is already logged in (e.g. on page refresh),
  // we just ask the API: if the cookie is valid, /auth/me succeeds.
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await getMe();
        setUser(data.user);
      } catch {
        // No valid cookie / not logged in — that's a normal, expected state,
        // not an error worth surfacing.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginAPI({ email, password });
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await registerAPI({ name, email, password });
    setUser(data.user);
    return data;
  };

  const googleLogin = async (userData) => {
    const { data } = await googleLoginAPI(userData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await logoutAPI(); // clears the httpOnly cookie server-side
    } catch {
      // Even if the network call fails, clear local state so the UI reflects
      // a logged-out user — worst case the cookie expires on its own later.
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
