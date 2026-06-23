import axios from 'axios';

// Reads the readable `csrfToken` cookie the backend sets on login/register/getMe.
// A cross-site attacker's page can forge a request that carries the httpOnly
// auth cookie, but can't READ the csrfToken cookie value (same-origin policy),
// so they can never also forge the matching X-CSRF-Token header — that's the
// whole point of the double-submit pattern.
const getCsrfToken = () => {
  const match = document.cookie.match(/(?:^|; )csrfToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // Needed for cross-origin cookie sending/receiving (auth + CSRF cookies).
  withCredentials: true,
});

// Attach the CSRF token from the readable cookie on every state-changing
// request. GET/HEAD are safe methods and don't need it — the backend won't
// check them — but including it there is harmless.
API.interceptors.request.use((config) => {
  const csrf = getCsrfToken();
  if (csrf) {
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401: cookie expired/missing — AuthContext will clear in-memory user.
    // 403 with CSRF message: usually means the csrfToken cookie was cleared
    // (e.g. user cleared browser cookies) — show a helpful message.
    if (err.response?.status === 403 && err.response?.data?.message?.includes('CSRF')) {
      console.warn('CSRF token mismatch — try refreshing the page.');
    }
    return Promise.reject(err);
  }
);

// Upload
export const uploadImage = (formData) => API.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const googleLogin = (data) => API.post('/auth/google', data);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.put(`/auth/reset-password/${token}`, { password });
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');

// Events
export const getEvents = (params) => API.get('/events', { params });
export const getEventById = (id) => API.get(`/events/${id}`);
export const getEventSeats = (id) => API.get(`/events/${id}/seats`);
export const holdSeats = (id, seatNumbers) => API.post(`/events/${id}/seats/hold`, { seatNumbers });
export const releaseSeats = (id, seatNumbers) => API.post(`/events/${id}/seats/release`, { seatNumbers });
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const getAnalytics = () => API.get('/events/analytics');

// Bookings
export const createBooking = (data) => API.post('/bookings', data);
export const getUserBookings = (params) => API.get('/bookings/my', { params });
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const getAllBookings = (params) => API.get('/bookings/all', { params });

// Payments
export const createOrder = (eventId, seatNumbers) => API.post('/payments/create-order', { eventId, seatNumbers });
export const verifyPayment = (data) => API.post('/payments/verify', data);

// Users
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/profile', data);
export const changePassword = (data) => API.put('/users/change-password', data);
export const toggleFavorite = (eventId) => API.put(`/users/favorites/${eventId}`);
export const getAllUsers = () => API.get('/users/all');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/users/${id}`);

export default API;
