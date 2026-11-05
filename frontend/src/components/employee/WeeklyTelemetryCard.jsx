// src/components/employee/WeeklyTelemetryCard.jsx
// Exact Row 3 Left layout matching user reference: Weekly Attendance & Shift Telemetry

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowUpRight } from 'lucide-react';

export default function WeeklyTelemetryCard({ attendance = {} }) {
  const navigate = useNavigate();

  // Dynamic or fallback rows matching the mockup:
  // Mon, Nov 2 | 08:58 AM - 05:32 PM | 8.5 hrs | Verified
  // Tue, Nov 3 | 09:02 AM - 05:46 PM | 8.7 hrs | Verified
  // Wed, Nov 4 | 08:45 AM - 05:15 PM | 8.5 hrs | Verified
  // Thu, Nov 5 | 01:07 PM - Active Shift | 1.2 hrs | Current
  const rows = [
    {
      id: '1',
      day: 'Mon, Nov 2',
      interval: '08:58 AM - 05:32 PM',
      hours: '8.5 hrs',
      status: 'Verified',
      isCurrent: false,
    },
    {
      id: '2',
      day: 'Tue, Nov 3',
      interval: '09:02 AM - 05:46 PM',
      hours: '8.7 hrs',
      status: 'Verified',
      isCurrent: false,
    },
    {
      id: '3',
      day: 'Wed, Nov 4',
      interval: '08:45 AM - 05:15 PM',
      hours: '8.5 hrs',
      status: 'Verified',
      isCurrent: false,
    },
    {
      id: '4',
      day: 'Thu, Nov 5',
      interval: attendance.clockInTime ? `${attendance.clockInTime} - Active Shift` : '01:07 PM - Active Shift',
      hours: attendance.shiftSeconds ? `${(attendance.shiftSeconds / 3600).toFixed(1)} hrs` : '1.2 hrs',
      status: 'Current',
      isCurrent: true,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#f8faff] via-[#f0f7ff] to-[#e0f2fe]/40 border border-[#bae6fd] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* 1. Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Weekly Attendance &amp; Shift Telemetry
              </h3>
              <span className="text-[10px] font-mono text-sky-800 bg-white/90 px-1.5 py-0.2 rounded border border-sky-200 shadow-2xs">
                hr.attendance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated biometric logging &amp; verified hours
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>Full Timesheet</span>
          <ArrowUpRight size={14} className="text-slate-500" />
        </button>
      </div>

      {/* 2. Telemetry Rows Matching Mockup */}
      <div className="divide-y divide-sky-100 mt-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`py-3.5 flex items-center justify-between gap-4 text-xs px-2.5 rounded-lg transition-colors ${
              row.isCurrent ? 'bg-white/90 border border-sky-200/80 shadow-2xs' : 'hover:bg-white/60'
            }`}
          >
            {/* Day Column */}
            <div className="w-28 sm:w-32 flex items-center gap-2 font-bold text-slate-800 shrink-0">
              <span>{row.day}</span>
              {row.isCurrent && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 animate-pulse"></span>
              )}
            </div>

            {/* Time Interval Column */}
            <div className="flex-1 text-center font-mono text-slate-600 text-xs truncate">
              {row.isCurrent ? (
                <span className="text-sky-700 font-bold">{row.interval}</span>
              ) : (
                row.interval
              )}
            </div>

            {/* Hours Logged Column */}
            <div className="w-16 sm:w-20 text-right font-bold text-slate-900 shrink-0">
              {row.hours}
            </div>

            {/* Status Pill Column */}
            <div className="w-20 text-right shrink-0">
              {row.isCurrent ? (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                  {row.status}
                </span>
              ) : (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-300">
                  {row.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
