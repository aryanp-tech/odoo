// src/pages/auth/LoginPage.jsx
// Clean Company Portal Light Theme Login Page

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
        toast.error(res.error || 'Login failed');
      }
    } catch {
      setErrorMsg('An unexpected authentication error occurred.');
      toast.error('Login error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col justify-between font-sans antialiased">
      {/* 1. Header Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-10 flex items-center justify-between shadow-2xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#2563eb] to-[#06b6d4] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Layers size={20} strokeWidth={2.2} />
          </div>
          <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
            Latitude Techno Labs
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield size={14} className="text-indigo-600" />
          <span className="font-semibold text-slate-600">Company Portal</span>
        </div>
      </header>

      {/* 2. Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md space-y-5">
          {/* Login Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sign In
              </h2>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aryan.p@latitudetechnolabs.org"
                    required
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/reset-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Keep me signed in on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="h-12 bg-white border-t border-slate-200/80 px-6 flex items-center justify-center text-xs text-slate-400">
        &copy; 2026 Latitude Techno Labs Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
