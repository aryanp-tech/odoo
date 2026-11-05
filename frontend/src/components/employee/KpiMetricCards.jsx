// src/components/employee/KpiMetricCards.jsx
// Exact 4 metric cards matching user reference: Attendance Report, Total Leaves Report, Project Timesheets, and Office Pulse Polls

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Folder, Vote } from 'lucide-react';

export default function KpiMetricCards({ attendance = {}, leaveQuotas = {} }) {
  const navigate = useNavigate();

  const weeklyHours = attendance.weeklyLoggedHours || 8.0;
  const targetHours = attendance.weeklyTarget || 40.0;
  const vacation = leaveQuotas.vacation || { allotted: 20, used: 5.0, left: 15.0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: ATTENDANCE REPORT (Blue Theme) */}
      <div 
        onClick={() => navigate('/attendance')}
        className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 shadow-xs hover:bg-[#dbeafe]/70 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <Clock size={13} />
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase leading-tight tracking-wide">
                ATTENDANCE<br />REPORT
              </div>
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-white/90 border border-blue-200 px-2 py-0.5 rounded shadow-2xs">
              Week 45
            </span>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {weeklyHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {targetHours.toFixed(0)}h Logged
            </span>
          </div>

          {/* Subtext */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1">
            <span>+0.2h overtime recorded</span>
            <span className="text-[#4338ca] font-bold">20% quota</span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-3">
          <div className="h-1.5 w-16 bg-[#4338ca] rounded-full" />
        </div>
      </div>

      {/* Card 2: TOTAL LEAVES REPORT (Emerald Theme) */}
      <div 
        onClick={() => navigate('/leaves')}
        className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-2xl p-5 shadow-xs hover:bg-[#d1fae5]/70 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={13} />
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase leading-tight tracking-wide">
                TOTAL LEAVES<br />REPORT
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-white/90 border border-emerald-200 px-2 py-0.5 rounded shadow-2xs">
              Annual Quota
            </span>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {vacation.left.toFixed(0)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {vacation.allotted.toFixed(0)} Days Left
            </span>
          </div>

          {/* Subtext */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1">
            <span>{vacation.used.toFixed(0)} days consumed</span>
            <span className="text-emerald-700 font-bold">75% balance</span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-3">
          <div className="h-1.5 w-32 bg-[#10b981] rounded-full" />
        </div>
      </div>

      {/* Card 3: PROJECT TIMESHEETS (Amber Theme) */}
      <div 
        onClick={() => navigate('/project-timesheets')}
        className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-5 shadow-xs hover:bg-[#fef3c7]/80 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Folder size={13} />
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase leading-tight tracking-wide">
                PROJECT<br />TIMESHEETS
              </div>
            </div>
            <span className="text-[10px] font-semibold text-amber-800 bg-white/90 border border-amber-200 px-2 py-0.5 rounded shadow-2xs">
              Sprint 24
            </span>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              08
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Tasks In Progress
            </span>
          </div>

          {/* Subtext */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1">
            <span>4 active • 90% billable</span>
            <span className="text-amber-700 font-bold">On Track</span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-3">
          <div className="h-1.5 w-36 bg-[#f59e0b] rounded-full" />
        </div>
      </div>

      {/* Card 4: OFFICE PULSE POLLS (Purple Theme) */}
      <div 
        onClick={() => navigate('/voting')}
        className="bg-[#faf5ff] border border-[#e9d5ff] rounded-2xl p-5 shadow-xs hover:bg-[#f3e8ff]/80 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
      >
        <div>
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                <Vote size={13} />
              </div>
              <div className="text-xs font-bold text-slate-800 uppercase leading-tight tracking-wide">
                OFFICE<br />PULSE POLLS
              </div>
            </div>
            <span className="text-[10px] font-semibold text-purple-700 bg-white/90 border border-purple-200 px-1.5 py-0.2 rounded font-mono shadow-2xs">
              employee.voting
            </span>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1.5 my-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              01
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Active Ballot Open
            </span>
          </div>

          {/* Subtext */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1">
            <span>Q4 Hackathon Theme • 3d left</span>
            <span className="text-purple-700 font-bold">75% voted</span>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="mt-3">
          <div className="h-1.5 w-28 bg-[#8b5cf6] rounded-full" />
        </div>
      </div>
    </div>
  );
}
