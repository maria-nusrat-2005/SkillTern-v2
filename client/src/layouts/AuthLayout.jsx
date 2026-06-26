import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Star, Target, Sparkles, TrendingUp } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070b15]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#070b15] font-sans antialiased">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Column - Hero & Features */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#09151e] to-[#051111] border-r border-slate-900">
          {/* Decorative Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse-slow" />

          {/* Logo / Brand */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-emerald-400 font-extrabold text-lg">S</span>
              </div>
              <span className="text-xl font-black tracking-wider text-white uppercase">
                SkillTern
              </span>
            </Link>
          </div>

          {/* Hero Headline */}
          <div className="my-auto relative z-10 max-w-xl space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] tracking-tight">
                Find Your <br />
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-rose-305 bg-clip-text text-transparent">
                  Perfect
                </span> <br />
                Internship
              </h1>
              <p className="text-base xl:text-lg text-slate-400 leading-relaxed max-w-md">
                Connect with opportunities matched to your skills and career goals using intelligent matching.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Match Score */}
              <div className="bg-[#11192e] border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-black/20 group">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Star size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Match Score</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">See how well you fit each role instantly.</p>
                </div>
              </div>

              {/* Skill Gap */}
              <div className="bg-[#11192e] border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-lg hover:shadow-black/20 group">
                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Target size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Skill Gap</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Identify and bridge missing skills.</p>
                </div>
              </div>

              {/* Smart Recs */}
              <div className="bg-[#11192e] border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-lg hover:shadow-black/20 group">
                <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Smart Recs</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Get custom internship recommendations.</p>
                </div>
              </div>

              {/* Career Growth */}
              <div className="bg-[#11192e] border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-black/20 group">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Career Growth</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Track and grow your career step-by-step.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="text-xs text-slate-500 relative z-10">
            &copy; {new Date().getFullYear()} SkillTern. All rights reserved.
          </div>
        </div>

        {/* Right Column - Active Authentication Form */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex flex-col justify-center p-6 sm:p-12 lg:p-16 bg-[#070b15] relative">
          {/* Interactive background glow for right column on smaller screens */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl lg:hidden pointer-events-none" />

          {/* Brand Header (Only visible on mobile) */}
          <div className="lg:hidden text-center space-y-2 mb-8 relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-emerald-400 font-extrabold text-lg">S</span>
              </div>
              <span className="text-xl font-black tracking-wider text-white uppercase">
                SkillTern
              </span>
            </div>
            <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              Intelligent Internship Matching
            </p>
          </div>

          {/* Large Screen brand logo at the top right of the form layout */}
          <div className="hidden lg:flex flex-col items-center justify-center mb-8 space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                <span className="text-emerald-400 font-extrabold text-lg">S</span>
              </div>
              <span className="text-xl font-black tracking-wider text-white uppercase">
                SkillTern
              </span>
            </div>
            <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              Intelligent Internship Matching
            </p>
          </div>

          {/* Form Card Container */}
          <div className="w-full max-w-md mx-auto bg-[#111827] border border-slate-800/60 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/40 relative z-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
