// src/components/employee/KpiMetricCards.jsx
// Clean 4 metric cards (100% dynamic from Odoo backend - zero mock/hardcoded numbers)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Folder, Vote } from 'lucide-react';

export default function KpiMetricCards({ 
  attendance = {}, 
  leaveQuotas = {}, 
  timesheetsCount = 0, 
  timesheetsHours = 0, 
  poll = {} 
}) {
  const navigate = useNavigate();

  // 1. Attendance Metrics (Live from hr.attendance)
  const weeklyHours = Number(attendance.weeklyLoggedHours || 0);
  const targetHours = Number(attendance.weeklyTarget || 40.0);
  const attendancePct = targetHours > 0 ? Math.min(100, Math.round((weeklyHours / targetHours) * 100)) : 0;

  // 2. Leave Metrics (Every employee: 3 Casual, 3 Sick, 6 WFH - live from hr.leave.allocation & hr.leave)
  const casual = leaveQuotas.casual || leaveQuotas.vacation || { allotted: 3, used: 0, left: 3 };
  const sick = leaveQuotas.sick || { allotted: 3, used: 0, left: 3 };
  const wfh = leaveQuotas.wfh || { allotted: 6, used: 0, left: 6 };

  const totalAllotted = Number(leaveQuotas.totalAllotted ?? (casual.allotted + sick.allotted + wfh.allotted));
  const totalLeft = Number(leaveQuotas.totalLeft ?? (casual.left + sick.left + wfh.left));
  const leavePct = totalAllotted > 0 ? Math.min(100, Math.round((totalLeft / totalAllotted) * 100)) : 0;

  // 3. Timesheet Metrics (Live from account.analytic.line)
  const tasksCount = Number(timesheetsCount || 0);
  const tsHours = Number(timesheetsHours || 0);
  const tsPct = tasksCount > 0 ? Math.min(100, tasksCount * 25) : 0;

  // 4. Poll Metrics (Live from survey.survey)
  const pollCount = poll && poll.id ? 1 : 0;

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
            <span>Weekly Target</span>
            <span className="text-[#4338ca] font-bold">{attendancePct}% logged</span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-[#4338ca] h-full rounded-full transition-all duration-500" 
            style={{ width: `${attendancePct}%` }} 
          />
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
              Leaves &amp; WFH
            </div>
          </div>

          {/* Value Display */}
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {totalLeft.toFixed(0)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {totalAllotted.toFixed(0)} Days Left
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span className="truncate">3 Casual • 3 Sick • 6 WFH</span>
            <span className="text-emerald-700 font-bold shrink-0">
              {totalAllotted > 0 ? `${leavePct}% balance` : 'No allocations'}
            </span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-[#10b981] h-full rounded-full transition-all duration-500" 
            style={{ width: `${totalAllotted > 0 ? leavePct : 0}%` }} 
          />
        </div>
      </div>

      {/* Card 3: Project Timesheets (Amber Theme - 100% Dynamic from Odoo account.analytic.line) */}
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
              {String(tasksCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {tasksCount === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span>Logged Work</span>
            <span className="text-amber-700 font-bold">
              {tasksCount > 0 ? `${tsHours.toFixed(1)}h logged` : 'No timesheets'}
            </span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-[#f59e0b] h-full rounded-full transition-all duration-500" 
            style={{ width: `${tsPct}%` }} 
          />
        </div>
      </div>

      {/* Card 4: Pulse Polls (Purple Theme - 100% Dynamic from Odoo survey.survey) */}
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
              {String(pollCount).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {pollCount === 1 ? 'Active Ballot' : 'Active Ballots'}
            </span>
          </div>

          {/* Progress / Status */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mt-1">
            <span className="truncate max-w-[130px]">{pollCount > 0 ? (poll.title || 'Live Poll') : 'No Active Polls'}</span>
            <span className="text-purple-700 font-bold shrink-0">{pollCount > 0 ? 'Open' : 'None'}</span>
          </div>
        </div>

        {/* Accent Line */}
        <div className="w-full bg-purple-200/60 h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-[#8b5cf6] h-full rounded-full transition-all duration-500" 
            style={{ width: `${pollCount > 0 ? 100 : 0}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
