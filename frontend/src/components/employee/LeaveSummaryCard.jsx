// src/components/employee/LeaveSummaryCard.jsx
// Consolidated quota & balance view with category progress breakdown

import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';

export default function LeaveSummaryCard({ leaveQuotas = {}, onRequestLeave }) {
  const casual = leaveQuotas.casual || { allotted: 3, taken: 0, left: 3 };
  const sick = leaveQuotas.sick || { allotted: 3, taken: 0, left: 3 };
  const compOff = leaveQuotas.wfh || leaveQuotas.compOff || { left: 6, subtext: 'Work From Home (WFH)' };
  const optional = leaveQuotas.optional || { left: 0, subtext: 'Applicable till Dec 31' };
  const totalUsable = leaveQuotas.totalLeft ?? 12;

  const casualPct = casual.allotted > 0 ? Math.round((casual.left / casual.allotted) * 100) : 70;
  const sickPct = sick.allotted > 0 ? Math.round((sick.left / sick.allotted) * 100) : 70;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Leave Summary & Available Balance
              </h3>
              <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                hr.leave.allocation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidated quota & balance view
            </p>
          </div>
        </div>

        {/* Total Usable Balance Highlight & Button */}
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL USABLE BALANCE
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {totalUsable}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Days Available
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestLeave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Apply for Leave</span>
          </button>
        </div>

        {/* Detailed Rows */}
        <div className="space-y-4 pt-4">
          {/* Row 1: Casual / Paid Leave */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800">Casual / Paid Leave</span>
              <span className="text-slate-800 font-bold">{casual.left} Days Left</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
              <span>Remaining of {casual.allotted} Allotted</span>
              <span>{casual.taken} used</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#312e81] h-full rounded-full transition-all duration-500"
                style={{ width: `${casualPct}%` }}
              />
            </div>
          </div>

          {/* Row 2: Sick / Medical Leave */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800">Sick / Medical Leave</span>
              <span className="text-slate-800 font-bold">{sick.left} Days Left</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
              <span>Remaining of {sick.allotted} Allotted</span>
              <span>{sick.taken} used</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-[#4f46e5] h-full rounded-full transition-all duration-500"
                style={{ width: `${sickPct}%` }}
              />
            </div>
          </div>

          {/* Row 3: Compensatory Off */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800">Compensatory Off (Comp-off)</span>
              <span className="text-emerald-600 font-bold">{compOff.left} Days Available</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {compOff.subtext}
            </p>
          </div>

          {/* Row 4: Optional / Floating Festival Holidays */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800">Optional / Floating Festival Holidays</span>
              <span className="text-slate-700 font-bold">{optional.left} Days Available</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {optional.subtext}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

