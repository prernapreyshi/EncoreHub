import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';

const StrengthBar = ({ password }) => {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-dark-border'}`} />
        ))}
      </div>
      <p className={`text-xs ${score <= 1 ? 'text-red-400' : score === 2 ? 'text-orange-400' : score === 3 ? 'text-yellow-400' : 'text-green-400'}`}>
        {labels[score - 1] || ''}
      </p>
    </div>
  );
};

const Signup = () => {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.email) { setError('Email is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please accept the terms to continue'); return; }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      toast.success('Account created! Welcome to EncoreHub 🎉');
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      await googleLogin({
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        avatar: decoded.picture,
      });
      toast.success(`Welcome to EncoreHub, ${decoded.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Google sign-in failed');
    }
  };

  const perks = [
    'Instant ticket booking & confirmation',
    'Exclusive early access to events',
    'Easy cancellations & refunds',
    'Personalised event recommendations',
  ];

  return (
    <PageTransition>
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-black to-dark-card items-center justify-center">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #E50914 0%, transparent 50%), radial-gradient(circle at 20% 80%, #ff6b35 0%, transparent 40%)' }}
        />
        <div className="relative z-10 p-12">
          <Link to="/" className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center font-black text-white text-xl">E</div>
            <span className="text-3xl font-black text-white">Encore<span className="text-primary">Hub</span></span>
          </Link>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Join <span className="text-primary">Millions</span><br />of Live Event<br />Lovers
          </h2>
          <p className="text-gray-400 mb-8">Create your free account and start discovering amazing experiences near you.</p>
          <div className="space-y-3">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="w-3 h-3 text-primary" />
                </div>
                <span className="text-gray-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-black overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white text-sm">E</div>
            <span className="text-xl font-black text-white">Encore<span className="text-primary">Hub</span></span>
          </Link>

          <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
          <p className="text-gray-400 mb-8">Start your journey. It's free forever.</p>

          {/* Google Sign-Up */}
          <div className="flex justify-center mb-5">
            {process.env.REACT_APP_GOOGLE_CLIENT_ID && process.env.REACT_APP_GOOGLE_CLIENT_ID !== 'your_google_client_id_here' ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in failed')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="signup_with"
                width="368"
              />
            ) : (
              <button
                onClick={() => toast('Add REACT_APP_GOOGLE_CLIENT_ID to .env to enable Google Sign-Up', { icon: 'ℹ️' })}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-dark-border hover:border-gray-500 text-gray-400 font-medium transition-all hover:bg-white/5"
              >
                <FcGoogle className="w-5 h-5" /> Continue with Google
                <span className="text-xs text-gray-600">(not configured)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-dark-border" />
            <span className="text-gray-500 text-sm">or register with email</span>
            <div className="flex-1 border-t border-dark-border" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-5 text-red-400 text-sm">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  name="name" type="text" value={form.name} onChange={handleChange}
                  placeholder="John Doe" className="input pl-10" required
                  autoComplete="name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input pl-10" required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="Min. 6 characters" className="input pl-10 pr-10" required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={form.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  name="confirm" type="password" value={form.confirm} onChange={handleChange}
                  placeholder="Re-enter your password" className="input pl-10" required
                  autoComplete="new-password"
                />
                {form.confirm && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${form.password === form.confirm ? 'text-green-400' : 'text-red-400'}`}>
                    {form.password === form.confirm
                      ? <FiCheck className="w-4 h-4" />
                      : <FiAlertCircle className="w-4 h-4" />
                    }
                  </div>
                )}
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-gray-400 text-sm">
                I agree to the{' '}
                <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </span>
            </label>
            <button
              type="submit" disabled={loading}
              className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Signup;
