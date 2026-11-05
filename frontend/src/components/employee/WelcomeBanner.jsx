// src/components/employee/WelcomeBanner.jsx
// Exact Row 1 layout matching user reference: Greeting dossier (left) + Daily Attendance with square buttons (right)

import React, { useState, useEffect } from 'react';
import { Power, Coffee, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useTogglePunchMutation,
  useToggleBreakMutation,
} from '../../services/api/apiSlice';

export default function WelcomeBanner({ user = {}, attendance = {} }) {
  const [togglePunch, { isLoading: isPunchLoading }] = useTogglePunchMutation();
  const [toggleBreak, { isLoading: isBreakLoading }] = useToggleBreakMutation();

  const isClockedIn = attendance.clockedIn ?? true;
  const isBreak = attendance.onBreak ?? false;
  const clockInTime = attendance.clockInTime || '04:07 PM';
  const initialSeconds = attendance.shiftSeconds || 4320; // 01h 12m

  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(attendance.shiftSeconds || 4320);
  }, [attendance.shiftSeconds]);

  useEffect(() => {
    if (!isClockedIn || isBreak) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, isBreak]);

  const formatElapsed = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    return `${h}h ${m}m elapsed`;
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
        toast.success(`Clocked in at ${res.clockInTime || 'now'}`);
      } else {
        toast.success(`Clocked out at ${res.clockOutTime || 'now'}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to update attendance');
    }
  };

  const handleBreakToggle = async () => {
    try {
      const res = await toggleBreak().unwrap();
      if (res.onBreak) {
        toast('Break active ☕', { icon: '☕' });
      } else {
        toast.success('Break ended. Back on duty!');
      }
    } catch (err) {
      toast.error('Failed to toggle break');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* 1. Left Card: Greeting Dossier (Soft Violet / Indigo Component Theme) */}
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
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Active
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white/90 border border-indigo-100 px-2.5 py-0.5 rounded-full shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Munich HQ - Desk 4-D
            </span>
          </div>

          {/* Headline Greeting */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-3">
            {greetingText}, {user?.name || 'Aryan Patel'} 👋
          </h2>

          <p className="text-xs text-slate-600 mt-1">
            Here is your workday overview, balance status, and operational agenda for {todayDateStr}.
          </p>
        </div>

        {/* Bottom Meta Row */}
        <div className="flex items-center justify-between text-xs pt-4 border-t border-indigo-200/60 mt-4">
          <span className="text-slate-600 font-medium">
            Employee ID: <strong className="text-slate-900 font-bold">#003</strong>
          </span>
          <span className="font-bold text-[#4338ca]">
            {user?.department || 'Core Platform Group'}
          </span>
        </div>
      </div>

      {/* 2. Right Card: Daily Attendance (Soft Sky / Blue Component Theme) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe]/60 to-[#bae6fd]/30 border border-[#bae6fd] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center shrink-0">
                <Clock size={15} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  Daily Attendance
                </h3>
                <span className="text-[10px] text-sky-800 bg-white/90 px-1.5 py-0.2 rounded border border-sky-200 font-mono inline-block mt-0.5 shadow-2xs">
                  hr.attendance
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>In at {clockInTime}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                {formatElapsed(seconds)}
              </div>
            </div>
          </div>

          {/* Two Square Buttons (Matching Mockup) */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Square Button 1: Punch Out / In */}
            <button
              type="button"
              onClick={handlePunchToggle}
              disabled={isPunchLoading}
              className={`p-3.5 rounded-2xl transition-all cursor-pointer shadow-xs flex flex-col items-center justify-center text-center ${
                isClockedIn
                  ? 'bg-[#4338ca] hover:bg-[#3730a3] text-white shadow-indigo-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
              } disabled:opacity-50`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center mb-1">
                <Power size={16} />
              </div>
              <div className="text-xs font-bold leading-tight">
                {isPunchLoading ? 'Updating...' : isClockedIn ? 'Punch Out' : 'Punch In'}
              </div>
              <div className="text-[9px] text-indigo-200 mt-0.5 leading-tight">
                {isClockedIn ? 'Click to end shift' : 'Click to start shift'}
              </div>
            </button>

            {/* Square Button 2: Tea Break */}
            <button
              type="button"
              onClick={handleBreakToggle}
              disabled={!isClockedIn || isBreakLoading}
              className={`p-3.5 rounded-2xl transition-all border cursor-pointer shadow-2xs flex flex-col items-center justify-center text-center ${
                isBreak
                  ? 'bg-amber-400 text-white border-amber-400'
                  : 'bg-[#fffbeb] hover:bg-[#fef3c7] border-[#fef08a] text-slate-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="w-8 h-8 rounded-full bg-[#fde68a] text-[#b45309] flex items-center justify-center mb-1">
                <Coffee size={16} />
              </div>
              <div className="text-xs font-bold text-amber-950 leading-tight">
                {isBreakLoading ? 'Updating...' : isBreak ? 'End Break' : 'Tea Break'}
              </div>
              <div className="text-[9px] text-amber-700 mt-0.5 leading-tight">
                {isBreak ? 'Click to resume' : 'Pause active timer'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
