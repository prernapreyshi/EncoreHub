import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email. Please try again.');
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
          {!sent ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
                <FiMail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400 mb-6 text-sm">
                No worries! Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 text-red-400 text-sm">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><FiSend className="w-4 h-4" /> Send Reset Link</>
                  }
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-6 mx-auto">
                <FiCheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Check Your Email</h1>
              <p className="text-gray-400 mb-2 text-sm">
                We've sent a password reset link to:
              </p>
              <p className="text-white font-semibold mb-6">{email}</p>
              <p className="text-gray-500 text-xs mb-8">
                Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button>.
              </p>
              <Link to="/login" className="btn-primary inline-block px-8 py-3">Back to Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
