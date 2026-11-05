// src/components/employee/LeavesAndQuotasCard.jsx
// Clean Leaves & Quotas card with concise vacation balances & pending request

import React from 'react';
import { Umbrella, Plus, User } from 'lucide-react';

export default function LeavesAndQuotasCard({ leaveQuotas = {}, onRequestLeave }) {
  const vacation = leaveQuotas.vacation || { allotted: 20, used: 5.5, left: 14.5 };
  const sick = leaveQuotas.sick || { allotted: 10, used: 2, left: 8.0 };
  const activeReq = leaveQuotas.activeRequest || {
    title: 'Dec 24 - Dec 26 (Christmas Break)',
    subtext: 'Paid Time Off • 3 Days',
    approver: 'Sarah Chen',
    status: 'Pending Review',
  };

  const vacationPct = Math.round((vacation.left / vacation.allotted) * 100);
  const sickPct = Math.round((sick.left / sick.allotted) * 100);

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4.5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Umbrella size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Leaves &amp; Balances
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestLeave}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-[#4338ca] hover:bg-[#3730a3] transition-colors cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Apply</span>
        </button>
      </div>

      {/* Two side-by-side metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Vacation */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Vacation
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-xl font-black text-slate-900">
              {vacation.left.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">Days</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {vacation.used.toFixed(1)} used / {vacation.allotted.toFixed(0)} total
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#312e81] h-full rounded-full transition-all duration-500"
              style={{ width: `${vacationPct}%` }}
            />
          </div>
        </div>

        {/* Sick */}
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Sick Leave
          </div>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-xl font-black text-slate-900">
              {sick.left.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">Days</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {sick.left.toFixed(0)} of {sick.allotted.toFixed(0)} available
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{ width: `${sickPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ACTIVE REQUEST Subcard */}
      <div className="p-3 rounded-xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Request
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            {activeReq.status}
          </span>
        </div>

        <h4 className="text-xs font-bold text-slate-900 tracking-tight">
          {activeReq.title}
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {activeReq.subtext}
        </p>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
          <User size={12} className="text-slate-400" />
          <span>Approver: <strong className="text-slate-700">{activeReq.approver}</strong></span>
        </div>
      </div>
    </div>
  );
}
