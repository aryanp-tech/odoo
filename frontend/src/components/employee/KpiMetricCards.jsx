// src/components/employee/KpiMetricCards.jsx
// Clean 4 metric cards: Attendance Report, Leaves Balance, Project Timesheets, and Pulse Polls (no extra labels or clutter)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Folder, Vote } from 'lucide-react';

export default function KpiMetricCards({ attendance = {}, leaveQuotas = {} }) {
  const navigate = useNavigate();

  const weeklyHours = attendance.weeklyLoggedHours || 8.0;
  const targetHours = attendance.weeklyTarget || 40.0;
  const vacation = leaveQuotas.vacation || { allotted: 20, used: 5.0, left: 15.0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Attendance Report (Blue Theme) */}
      <div 
        onClick={() => navigate('/attendance')}
        className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 shadow-xs hover:bg-[#dbeafe]/70 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Attendance Report
            </div>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {weeklyHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {targetHours.toFixed(0)}h
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span>Weekly Hours</span>
            <span className="text-[#4338ca] font-bold">20% of goal</span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div className="bg-[#4338ca] h-full rounded-full w-[20%]" />
        </div>
      </div>

      {/* Card 2: Leaves Balance (Emerald Theme) */}
      <div 
        onClick={() => navigate('/leaves')}
        className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-5 shadow-xs hover:bg-[#d1fae5]/70 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Total Leaves
            </div>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {vacation.left.toFixed(0)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {vacation.allotted.toFixed(0)} Days Left
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span>Available Balance</span>
            <span className="text-emerald-700 font-bold">75% remaining</span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div className="bg-[#10b981] h-full rounded-full w-[75%]" />
        </div>
      </div>

      {/* Card 3: Project Timesheets (Amber Theme) */}
      <div 
        onClick={() => navigate('/timesheets')}
        className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-5 shadow-xs hover:bg-[#fef3c7]/80 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <Folder size={14} />
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Project Timesheets
            </div>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              08
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Tasks
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span>In Progress</span>
            <span className="text-amber-700 font-bold">4 active</span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div className="bg-[#f59e0b] h-full rounded-full w-[65%]" />
        </div>
      </div>

      {/* Card 4: Pulse Polls (Purple Theme) */}
      <div 
        onClick={() => navigate('/voting')}
        className="bg-[#faf5ff] border border-[#e9d5ff] rounded-2xl p-5 shadow-xs hover:bg-[#f3e8ff]/80 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-200 text-purple-700 flex items-center justify-center shrink-0">
              <Vote size={14} />
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Office Polls
            </div>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              01
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Active Ballot
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span>Hackathon Vote</span>
            <span className="text-purple-700 font-bold">Open</span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-purple-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div className="bg-[#8b5cf6] h-full rounded-full w-[50%]" />
        </div>
      </div>
    </div>
  );
}
