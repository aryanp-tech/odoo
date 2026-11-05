// src/components/employee/AttendanceCard.jsx
// Daily Attendance & Work Mode widget with live shift timer, punch toggle & break handler

import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useTogglePunchMutation,
  useToggleBreakMutation,
} from '../../services/api/apiSlice';

export default function AttendanceCard({ attendance = {} }) {
  const [togglePunch, { isLoading: isPunchLoading }] = useTogglePunchMutation();
  const [toggleBreak, { isLoading: isBreakLoading }] = useToggleBreakMutation();

  const isClockedIn = attendance.clockedIn ?? true;
  const isBreak = attendance.onBreak ?? false;
  const clockInTime = attendance.clockInTime || '09:15 AM';

  // Live ticking shift seconds
  const [secondsElapsed, setSecondsElapsed] = useState(attendance.shiftSeconds || 15480);

  useEffect(() => {
    if (attendance.shiftSeconds) {
      setSecondsElapsed(attendance.shiftSeconds);
    }
  }, [attendance.shiftSeconds]);

  useEffect(() => {
    if (!isClockedIn || isBreak) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, isBreak]);

  // Format seconds to "04h 18m"
  const formatShiftTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  };

  const handlePunchToggle = async () => {
    try {
      const res = await togglePunch().unwrap();
      if (res.clockedIn) {
        toast.success(`Clocked in successfully at ${res.clockInTime}!`);
      } else {
        toast.success(`Clocked out at ${res.clockOutTime}. Have a great evening!`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to update attendance');
    }
  };

  const handleBreakToggle = async () => {
    try {
      const res = await toggleBreak().unwrap();
      if (res.onBreak) {
        toast('Enjoy your break! ☕', { icon: '☕' });
      } else {
        toast.success('Break ended. Welcome back!');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to toggle break');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Status & Timer */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Clock size={22} strokeWidth={2} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Daily Attendance &amp; Work Mode
              </h3>
              <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                hr.attendance
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1 flex-wrap">
              {isClockedIn ? (
                <>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Clocked in at {clockInTime}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600">
                    Shift Time:{' '}
                    <span className="font-semibold text-slate-800">
                      {formatShiftTime(secondsElapsed)}
                    </span>
                  </span>
                  {isBreak && (
                    <span className="ml-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      On Break
                    </span>
                  )}
                </>
              ) : (
                <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Clocked out
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls: Action Buttons */}
        <div className="flex items-center gap-2 lg:self-center">
          <button
            type="button"
            onClick={handlePunchToggle}
            disabled={isPunchLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isClockedIn
                ? 'bg-[#4338ca] hover:bg-[#3730a3] text-white shadow-indigo-100'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
          >
            <Power size={14} />
            <span>{isClockedIn ? 'Punch Out' : 'Punch In'}</span>
          </button>

          <button
            type="button"
            onClick={handleBreakToggle}
            disabled={!isClockedIn || isBreakLoading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              isBreak
                ? 'bg-amber-500 text-white border-amber-500 font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Coffee size={14} />
            <span>{isBreak ? 'End Break' : 'Break'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
