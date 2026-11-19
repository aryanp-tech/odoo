// src/pages/auth/ResetPasswordPage.jsx
// Company Portal Light Theme Password Recovery Workflow

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { requestPasswordReset, resetPassword, loginUser } from '../../services/authService';
import logoImg from '../../assets/images.png';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  // Multi-step flow: 'request' -> 'verify' -> 'success'
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('aryan.p@latitudetechnolabs.org');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Send Reset Code
  const handleRequestCode = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = requestPasswordReset(email);
      if (res.success) {
        setGeneratedCode(res.code);
        setCode(res.code); // Pre-fill for seamless testing
        setStep('verify');
        toast.success(`Verification code sent to ${email}`);
      } else {
        setErrorMsg(res.error || 'Failed to send verification code.');
        toast.error(res.error || 'Request failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Confirm Code and Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      toast.error('Password too short');
      return;
    }

    setIsLoading(true);

    try {
      const res = resetPassword(email, code, newPassword);
      if (res.success) {
        // Automatically authenticate user with new password
        await loginUser(email, newPassword);
        setStep('success');
        toast.success('Password successfully reset!');
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
        toast.error(res.error || 'Reset failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    }
    if (newPassword.length >= 6) {
      return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    }
    return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col justify-between font-sans antialiased">
      {/* 1. Header Navigation Bar (Clean company portal header without extra tags) */}
      <header className="h-16 bg-[#0d1326] border-b border-[#17213d] px-6 sm:px-10 flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center">
          <img
            src={logoImg}
            alt="LatitudeTechnoLabs"
            className="h-10 sm:h-11 w-auto max-w-[190px] object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <Link
          to="/login"
          className="text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* 2. Main Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md space-y-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
            {/* Step 1: Request Code */}
            {step === 'request' && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Reset Your Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your corporate email address to receive a secure verification code.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleRequestCode} className="space-y-4">
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-2">
                  <Shield size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    A 6-digit one-time code will be dispatched to your company inbox immediately.
                  </span>
                </div>
              </>
            )}

            {/* Step 2: Verify Code and Set Password */}
            {step === 'verify' && (
              <>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the code sent to <strong className="text-slate-800">{email}</strong> and your new password.
                  </p>
                </div>

                {generatedCode && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Test Verification Code:</span>
                      <span className="font-mono font-bold text-sm text-indigo-700 tracking-wider">
                        {generatedCode}
                      </span>
                    </div>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                      Pre-filled
                    </span>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Verification Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="6-digit code"
                        required
                        maxLength={6}
                        className="w-full text-xs font-mono font-bold tracking-wider text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      {strength && (
                        <span className={`text-[11px] font-bold ${strength.text}`}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
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

                    {/* Live Strength Bar */}
                    {newPassword && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            newPassword.length >= 4 ? strength.color : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            newPassword.length >= 6 ? strength.color : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            newPassword.length >= 8 && /[A-Z]/.test(newPassword)
                              ? strength.color
                              : 'bg-slate-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password &amp; Sign In</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Change Email Address
                </button>
              </>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Password Updated!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your credentials have been securely refreshed. You are now logged in as{' '}
                    <strong className="text-slate-800">{email}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="h-12 bg-white border-t border-slate-200/80 px-6 flex items-center justify-center text-xs text-slate-400">
        &copy; 2026 LatitudeTechnoLabs. All rights reserved.
      </footer>
    </div>
  );
}
