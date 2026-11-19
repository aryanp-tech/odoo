// src/components/employee/WelcomeBanner.jsx
// Row 1: Clean Greeting dossier with eSmile-Fun developer feed (left) + Daily Attendance with Telemetry Strip & Square Buttons (right)

import React, { useState, useEffect } from 'react';
import { Power, Coffee, Clock, Briefcase, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useTogglePunchMutation,
  useToggleBreakMutation,
} from '../../services/api/apiSlice';
import { getRandomSmileFun } from '../../utils/esmileFun';

export default function WelcomeBanner({ user = {}, attendance = {} }) {
  const [togglePunch, { isLoading: isPunchLoading }] = useTogglePunchMutation();
  const [toggleBreak, { isLoading: isBreakLoading }] = useToggleBreakMutation();

  const isClockedIn = Boolean(attendance.clockedIn);
  const isBreak = Boolean(attendance.onBreak);
  const clockInTime = attendance.clockInTime || '';
  const initialSeconds = Number(attendance.shiftSeconds) || 0;

  const [seconds, setSeconds] = useState(initialSeconds);
  const [currentFun, setCurrentFun] = useState(() => getRandomSmileFun());

  useEffect(() => {
    setSeconds(Number(attendance.shiftSeconds) || 0);
  }, [attendance.shiftSeconds]);

  // When clocked in and NOT on break, timer increments every second
  useEffect(() => {
    if (!isClockedIn || isBreak) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, isBreak]);

  // Auto-cycle through eSmile-Fun developer feed every 25 seconds
  useEffect(() => {
    const funTimer = setInterval(() => {
      setCurrentFun((prev) => getRandomSmileFun(prev?.id));
    }, 25000);
    return () => clearInterval(funTimer);
  }, []);

  const handleNextFun = () => {
    setCurrentFun((prev) => getRandomSmileFun(prev?.id));
  };

  const formatElapsed = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}h ${m}m ${s}s`;
  };

  // Dynamic greeting based on current local time
  const [greetingText, setGreetingText] = useState('Good evening');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreetingText('Good morning');
    } else if (hour >= 12 && hour < 17) {
      setGreetingText('Good afternoon');
    } else if (hour >= 17 && hour < 21) {
      setGreetingText('Good evening');
    } else {
      setGreetingText('Good night');
    }
  }, []);

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handlePunchToggle = async () => {
    try {
      const res = await togglePunch().unwrap();
      if (res.clockedIn) {
        toast.success(`Clocked in at ${res.clockInTime || 'now'}. Shift timer started!`);
      } else {
        toast.success(`Clocked out at ${res.clockOutTime || 'now'}. Attendance saved to Odoo.`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to update attendance');
    }
  };

  const handleBreakToggle = async () => {
    try {
      const res = await toggleBreak().unwrap();
      if (res.onBreak) {
        toast('Tea Break active ☕ Shift timer paused.', { icon: '☕' });
      } else {
        toast.success('Welcome back to work! Shift timer resumed.');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle break');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* 1. Left Card: Greeting Dossier + eSmile-Fun Developer Feed */}
      <div className="lg:col-span-8 bg-gradient-to-br from-[#f5f3ff] via-[#ede9fe]/60 to-[#ede9fe] border border-[#ddd6fe] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Top Meta Badges Row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-[#4338ca] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.avatar_initials || 'AP'}
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-white/90 border border-indigo-100 px-2.5 py-0.5 rounded-md shadow-2xs">
              {user?.job_title || 'Software Engineer'}
            </span>
          </div>

          {/* Headline Greeting + Employee ID Opposite */}
          <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {greetingText}, {user?.name || 'Aryan Patel'} 👋
            </h2>

            {/* Employee ID moved opposite to greeting */}
            <span className="text-xs font-medium text-slate-600 bg-white/90 border border-indigo-100 px-3 py-1 rounded-xl shadow-2xs shrink-0">
              Employee ID: <strong className="text-slate-900 font-bold">#{String(user?.employee_id || user?.id || 1).padStart(3, '0')}</strong>
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-1">
            Workday overview and balance status for {todayDateStr}.
          </p>

          {/* eSmile-Fun: Random Tech News, Trending Developer Insights & Humour */}
          <div className="mt-4 bg-white/85 hover:bg-white/95 border border-indigo-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs shrink-0">
                  {currentFun.icon}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <span>{currentFun.category}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                </span>
                <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {currentFun.tag}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextFun}
                title="Next developer bite"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Sparkles size={11} className="text-indigo-600" />
                <span>Next Bite</span>
              </button>
            </div>

            <p className="text-xs sm:text-[13px] font-medium text-slate-800 leading-relaxed italic">
              "{currentFun.text}"
            </p>

            {currentFun.author && (
              <div className="text-right text-[10px] font-bold text-indigo-600 mt-1">
                — {currentFun.author}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Right Card: Daily Attendance */}
      <div className="lg:col-span-4 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe]/60 to-[#bae6fd]/30 border border-[#bae6fd] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-sky-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-200 text-sky-800 flex items-center justify-center shrink-0">
                <Clock size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Daily Attendance
              </h3>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              !isClockedIn
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : isBreak
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                !isClockedIn ? 'bg-slate-400' : isBreak ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
              }`} />
              <span>{!isClockedIn ? 'Punched Out' : isBreak ? 'On Break' : 'Punched In'}</span>
            </span>
          </div>

          {/* Time & Count Telemetry Strip - Clear, Bold, and Prominent */}
          <div className="grid grid-cols-2 gap-2 mt-3 bg-white/90 border border-sky-200/90 rounded-xl p-2.5 shadow-2xs">
            {/* Metric 1: Check-in Time */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Check-in
              </div>
              <div className="text-sm font-black text-slate-900 tracking-tight mt-0.5">
                {isClockedIn ? (clockInTime || '--:--') : '--:--'}
              </div>
            </div>

            {/* Metric 2: Total Work Time (Live Seconds) */}
            <div className="border-l border-sky-200/80 pl-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>Total Work</span>
                {isBreak && (
                  <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1 rounded">
                    Paused
                  </span>
                )}
              </div>
              <div className="text-sm font-black font-mono text-sky-950 tracking-tight mt-0.5">
                {isClockedIn ? formatElapsed(seconds) : '00h 00m 00s'}
              </div>
            </div>
          </div>

          {/* Two Clean Square Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            {/* Square Button 1: Punch Out / In */}
            <button
              type="button"
              onClick={handlePunchToggle}
              disabled={isPunchLoading}
              className={`p-3 rounded-2xl transition-all cursor-pointer shadow-xs flex flex-col items-center justify-center text-center ${
                isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
              } disabled:opacity-50`}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center mb-1">
                <Power size={15} />
              </div>
              <div className="text-xs font-bold leading-tight">
                {isPunchLoading ? 'Updating...' : isClockedIn ? 'Punch Out' : 'Punch In'}
              </div>
            </button>

            {/* Square Button 2: Tea Break / Back to Work */}
            <button
              type="button"
              onClick={handleBreakToggle}
              disabled={!isClockedIn || isBreakLoading}
              className={`p-3 rounded-2xl transition-all border cursor-pointer shadow-2xs flex flex-col items-center justify-center text-center ${
                isBreak
                  ? 'bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-500 shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] border-[#fef08a] text-slate-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                isBreak ? 'bg-white/20 text-white' : 'bg-[#fde68a] text-[#b45309]'
              }`}>
                {isBreak ? <Briefcase size={15} /> : <Coffee size={15} />}
              </div>
              <div className={`text-xs font-bold leading-tight ${isBreak ? 'text-white' : 'text-amber-950'}`}>
                {isBreakLoading ? 'Updating...' : isBreak ? 'Back to Work' : 'Tea Break'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
