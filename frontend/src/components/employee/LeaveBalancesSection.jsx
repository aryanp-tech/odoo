// src/components/employee/LeaveBalancesSection.jsx
// 3 Quota metric cards with progress meters & Request Time Off trigger

import React from 'react';
import { Plus, Umbrella } from 'lucide-react';

export default function LeaveBalancesSection({ leaveQuotas = {}, onRequestLeave }) {
  const casual = leaveQuotas.casual || { allotted: 3, taken: 0, left: 3 };
  const sick = leaveQuotas.sick || { allotted: 3, taken: 0, left: 3 };
  const compOff = leaveQuotas.wfh || leaveQuotas.compOff || { allotted: 6, taken: 0, left: 6, subtext: 'Work From Home (WFH)' };

  // Calculate percentage used / remaining
  const casualPct = casual.allotted > 0 ? Math.round((casual.left / casual.allotted) * 100) : 0;
  const sickPct = sick.allotted > 0 ? Math.round((sick.left / sick.allotted) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              My Leave Balances & Quotas
            </h3>
            <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              hr.leave.allocation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Annual accrual for {leaveQuotas.annualYear || 2024} calendar year
          </p>
        </div>

        {/* Action Button: Request Time Off */}
        <button
          type="button"
          onClick={onRequestLeave}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Request Time Off</span>
        </button>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Casual / Paid Leave */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4.5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                CASUAL / PAID LEAVE
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Allotted: {casual.allotted}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {casual.left}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Days Left
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              {casual.taken} days taken this cycle
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-[#4338ca] h-full rounded-full transition-all duration-500"
              style={{ width: `${casualPct}%` }}
            />
          </div>
        </div>

        {/* Card 2: Sick Leave */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4.5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                SICK LEAVE
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Allotted: {sick.allotted}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {sick.left}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Days Left
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              {sick.taken} days taken this cycle
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${sickPct}%` }}
            />
          </div>
        </div>

        {/* Card 3: Compensatory Off */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4.5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                COMPENSATORY OFF
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Overtime credit
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {compOff.left}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Days Left
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              {compOff.subtext}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-500"
              style={{ width: `100%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

