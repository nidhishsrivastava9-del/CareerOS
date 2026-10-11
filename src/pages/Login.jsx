import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Target route to return to after login
  const from = location.state?.from?.pathname || '/';

  // If already logged in, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (result.success) {
        showToast(`Welcome back, ${result.user?.name || 'Student'}! 👋`);
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-glow-brand mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">CareerOS</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to track your career roadmap, skills, projects & DSA
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-8 bg-[#0D1322]/90 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex.rivera@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.04] text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm bg-white/[0.04] text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Info */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>JWT + bcrypt Secured Authentication</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              New user? Register below or sign in with your account.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Create CareerOS account
          </Link>
        </p>
      </div>
    </div>
  );
}
