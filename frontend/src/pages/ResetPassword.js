import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { resetPassword } from '../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await resetPassword(token, form.password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>
        <div className="card p-8">
          {!success ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
                <FiLock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Set New Password</h1>
              <p className="text-gray-400 mb-6 text-sm">Enter your new password below.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 text-red-400 text-sm">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                      placeholder="Min. 6 characters"
                      className="input pl-10 pr-10"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setError(''); }}
                      placeholder="Re-enter password"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6 mx-auto">
                <FiCheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Password Reset!</h1>
              <p className="text-gray-400 text-sm mb-6">
                Your password has been reset. Redirecting you to login...
              </p>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
