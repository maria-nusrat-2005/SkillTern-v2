import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, GraduationCap, Building2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors([]);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/onboarding');
    } catch (err) {
      const res = err.response?.data;
      if (res?.errors) {
        setFieldErrors(res.errors);
      }
      setError(res?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field) => fieldErrors.find((e) => e.field === field)?.message;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">Create your account</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-medium font-sans">Start discovering internship opportunities</p>
      </div>

      {error && (
        <div className="bg-red-955/40 border border-red-900/50 text-red-400 text-sm px-4 py-3 rounded-xl animate-slide-up">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 tracking-wide uppercase">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'student' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                form.role === 'student'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-350'
              }`}
            >
              <GraduationCap size={18} />
              Student
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'recruiter' })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                form.role === 'recruiter'
                  ? 'bg-violet-500/10 border-violet-500/50 text-violet-400 shadow-sm shadow-violet-500/10'
                  : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-350'
              }`}
            >
              <Building2 size={18} />
              Recruiter
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-xs font-bold text-slate-300 tracking-wide uppercase">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="register-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Maria Nusrat"
              className="w-full pl-10 pr-4 py-2.5 bg-[#e8f0fe] focus:bg-white border border-transparent focus:border-emerald-500/30 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 font-semibold focus:outline-none transition-all duration-200"
            />
          </div>
          {getFieldError('name') && <p className="text-xs text-red-400 font-medium mt-1">{getFieldError('name')}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="register-email" className="text-xs font-bold text-slate-300 tracking-wide uppercase">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="register-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="marianusrat.tonu34@gmail.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[#e8f0fe] focus:bg-white border border-transparent focus:border-emerald-500/30 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 font-semibold focus:outline-none transition-all duration-200"
            />
          </div>
          {getFieldError('email') && <p className="text-xs text-red-400 font-medium mt-1">{getFieldError('email')}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="register-password" className="text-xs font-bold text-slate-300 tracking-wide uppercase">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="register-password"
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
          {getFieldError('password') && <p className="text-xs text-red-400 font-medium mt-1">{getFieldError('password')}</p>}
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
            <>Create Account <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
