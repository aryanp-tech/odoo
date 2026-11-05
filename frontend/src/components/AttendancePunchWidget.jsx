// src/components/AttendancePunchWidget.jsx
import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Wifi, CheckCircle2, MapPin, Laptop } from 'lucide-react';

export default function AttendancePunchWidget({ roleName = "Employee" }) {
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [seconds, setSeconds] = useState(13338); // 03h 42m 18s initial
  const [punchTime] = useState("09:15 AM");

  useEffect(() => {
    let timer;
    if (isPunchedIn) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPunchedIn]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 8 hours standard shift = 28800 seconds
  const shiftProgress = Math.min(100, Math.round((seconds / 28800) * 100));

  const handlePunchToggle = () => {
    setIsPunchedIn(!isPunchedIn);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      
      {/* Header: Title + Status Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Attendance & Web Punch
            </h3>
            <p className="text-[11px] text-slate-400">ZK Biometrics & Geo Sync</p>
          </div>
        </div>

        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
          isPunchedIn 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${
            isPunchedIn ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`}></span>
          {isPunchedIn ? "On Duty" : "Checked Out"}
        </span>
      </div>

      {/* Main Digital Clock & Shift Status */}
      <div className="my-4 text-center bg-slate-50/70 p-4 rounded-xl border border-slate-100">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
          {isPunchedIn ? `Checked In Today at ${punchTime}` : "Shift Paused"}
        </div>
        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900">
          {formatTime(seconds)}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>Shift Progress (8h Target)</span>
            <span className="font-bold text-slate-700">{shiftProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${shiftProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Controls & Gateway Tag */}
      <div className="space-y-3">
        <button
          onClick={handlePunchToggle}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer ${
            isPunchedIn
              ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {isPunchedIn ? (
            <>
              <Square size={14} className="fill-current" />
              <span>Punch Out for Break / Day End</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              <span>Punch In Now (Resume Shift)</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center space-x-1">
            <Wifi size={13} className="text-emerald-500" />
            <span className="truncate">Port 4370 Connected</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin size={13} className="text-slate-400" />
            <span>Latitude HQ</span>
          </div>
        </div>
      </div>

    </div>
  );
}
