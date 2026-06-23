import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import PageTransition from '../components/common/PageTransition';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!form.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email';
    if (!form.password) return 'Password is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password');
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
      toast.success(`Welcome, ${decoded.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Google sign-in failed');
    }
  };

  const fill = (role) => {
    if (role === 'admin') setForm({ email: 'admin@encorehub.com', password: 'admin123' });
    else setForm({ email: 'user@encorehub.com', password: 'user123' });
    setError('');
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex">
      {/* Left – decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
          alt="Events"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/50" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white">E</div>
            <span className="text-2xl font-black text-white">Encore<span className="text-primary">Hub</span></span>
          </Link>
          <h2 className="text-5xl font-black text-white leading-tight mb-4">
            Your world of<br />live experiences<br /><span className="text-primary">awaits.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
            Concerts, sports, theatre, comedy — discover and book the events that move you.
          </p>
          <div className="mt-12 flex gap-8">
            {[['10M+', 'Users'], ['50K+', 'Events'], ['200+', 'Cities']].map(([n, l]) => (
              <div key={l}>
                <p className="text-white font-bold text-2xl">{n}</p>
                <p className="text-gray-400 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-black overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white text-sm">E</div>
            <span className="text-xl font-black text-white">Encore<span className="text-primary">Hub</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your account to continue</p>
          </div>

          {/* Demo pills */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="flex gap-2">
              <button
                onClick={() => fill('user')}
                className="flex-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 py-2 px-3 rounded-lg transition-colors font-medium"
              >
                👤 User
              </button>
              <button
                onClick={() => fill('admin')}
                className="flex-1 text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 py-2 px-3 rounded-lg transition-colors font-medium"
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 text-sm">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }}
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-light transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                  className="input pl-10 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 mt-2"
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : 'Sign In'
              }
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            {process.env.REACT_APP_GOOGLE_CLIENT_ID && process.env.REACT_APP_GOOGLE_CLIENT_ID !== 'your_google_client_id_here' ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in failed')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="signin_with"
                width="368"
              />
            ) : (
              <button
                onClick={() => toast('Add REACT_APP_GOOGLE_CLIENT_ID to .env to enable Google Sign-In', { icon: 'ℹ️' })}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/10 text-gray-400 hover:text-gray-300 hover:border-white/20 hover:bg-white/5 transition-all font-medium"
              >
                <FcGoogle className="w-5 h-5" /> Continue with Google
                <span className="text-xs text-gray-600">(not configured)</span>
              </button>
            )}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-light font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Login;
