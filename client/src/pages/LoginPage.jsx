import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">Welcome back! Please enter your details.</p>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 text-sm px-4 py-3 rounded-xl animate-slide-up">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-xs font-bold text-slate-300 tracking-wide uppercase">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[#e8f0fe] focus:bg-white border border-transparent focus:border-emerald-500/30 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 font-semibold focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-bold text-slate-300 tracking-wide uppercase">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-2.5 bg-[#e8f0fe] focus:bg-white border border-transparent focus:border-emerald-500/30 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 font-semibold focus:outline-none transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember me & submit wrapper */}
        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="keep-logged-in"
            className="w-4 h-4 rounded border-slate-800 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900"
          />
          <label htmlFor="keep-logged-in" className="text-xs font-semibold text-slate-400 select-none cursor-pointer">
            Keep me logged in
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
