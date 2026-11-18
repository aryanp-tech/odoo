// src/components/employee/WeeklyTelemetryCard.jsx
// Clean Weekly Attendance & Shift Telemetry (100% dynamic from backend hr.attendance)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowUpRight, Clock } from 'lucide-react';

export default function WeeklyTelemetryCard({ attendance = {} }) {
  const navigate = useNavigate();
  const telemetry = attendance.telemetryRows || [];

  return (
    <div className="bg-gradient-to-br from-[#f8faff] via-[#f0f7ff] to-[#e0f2fe]/40 border border-[#bae6fd] rounded-2xl p-6 shadow-xs">
      {/* 1. Card Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-sky-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Weekly Attendance Telemetry
          </h3>
        </div>

        <button
          type="button"
          onClick={() => navigate('/attendance')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <span>Full Timesheet</span>
          <ArrowUpRight size={14} className="text-slate-500" />
        </button>
      </div>

      {/* 2. Telemetry Rows */}
      {telemetry.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-1">
          <Clock size={24} className="mx-auto text-sky-400 mb-1" />
          <p className="text-xs font-semibold text-slate-600">No shift records for this week</p>
          <p className="text-[11px] text-slate-400">Punch in via top bar to record attendance in Odoo.</p>
        </div>
      ) : (
        <div className="divide-y divide-sky-100 mt-2">
          {telemetry.map((row) => (
            <div
              key={row.id}
              className={`py-3 flex items-center justify-between gap-4 text-xs px-2.5 rounded-lg transition-colors ${
                row.isToday ? 'bg-white/90 border border-sky-200/80 shadow-2xs' : 'hover:bg-white/60'
              }`}
            >
              {/* Day Column */}
              <div className="w-28 sm:w-32 flex items-center gap-2 font-bold text-slate-800 shrink-0">
                <span>{row.dateLabel}</span>
                {row.isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 animate-pulse"></span>
                )}
              </div>

              {/* Time Interval Column */}
              <div className="flex-1 text-center font-mono text-slate-600 text-xs truncate">
                <span className={row.isToday ? 'text-sky-700 font-bold' : ''}>
                  {row.punchIn} {row.punchOut ? `- ${row.punchOut}` : '- Active Shift'}
                </span>
              </div>

              {/* Hours Logged Column */}
              <div className="w-16 sm:w-20 text-right font-bold text-slate-900 shrink-0">
                {row.netTime}
              </div>

              {/* Status Pill Column */}
              <div className="min-w-[96px] text-right shrink-0">
                <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold ${
                  row.isToday
                    ? 'bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs'
                    : 'bg-emerald-100/90 text-emerald-800 border border-emerald-300'
                }`}>
                  {row.statusTag}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
