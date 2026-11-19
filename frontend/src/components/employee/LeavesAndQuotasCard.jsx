// src/components/employee/LeavesAndQuotasCard.jsx
// Clean Leaves & Quotas card with concise 3-category balances: 3 Casual, 3 Sick, 6 WFH (100% dynamic from backend)

import React from 'react';
import { Umbrella, Plus, User, Home, HeartPulse, Sparkles } from 'lucide-react';

export default function LeavesAndQuotasCard({ leaveQuotas = {}, onRequestLeave }) {
  const casual = leaveQuotas.casual || leaveQuotas.vacation || { allotted: 3, used: 0, left: 3 };
  const sick = leaveQuotas.sick || { allotted: 3, used: 0, left: 3 };
  const wfh = leaveQuotas.wfh || { allotted: 6, used: 0, left: 6 };
  const activeReq = leaveQuotas.activeRequest || null;

  const casualPct = casual.allotted > 0 ? Math.min(100, Math.round((casual.left / casual.allotted) * 100)) : 0;
  const sickPct = sick.allotted > 0 ? Math.min(100, Math.round((sick.left / sick.allotted) * 100)) : 0;
  const wfhPct = wfh.allotted > 0 ? Math.min(100, Math.round((wfh.left / wfh.allotted) * 100)) : 0;

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
              Leaves &amp; WFH Balances
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

      {/* 3 Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
        {/* Casual Leave */}
        <div className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                Casual
              </span>
              <Sparkles size={11} className="text-amber-600" />
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-xl font-black text-slate-900">
                {casual.left.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">Days</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {casual.used.toFixed(1)} used / {casual.allotted.toFixed(0)} total
            </div>
          </div>
          <div className="w-full bg-amber-200/80 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${casualPct}%` }}
            />
          </div>
        </div>

        {/* Sick Leave */}
        <div className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Sick Leave
              </span>
              <HeartPulse size={11} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-xl font-black text-slate-900">
                {sick.left.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">Days</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {sick.used.toFixed(1)} used / {sick.allotted.toFixed(0)} total
            </div>
          </div>
          <div className="w-full bg-emerald-200/80 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${sickPct}%` }}
            />
          </div>
        </div>

        {/* WFH (Remote) */}
        <div className="p-3 rounded-xl border border-purple-200/80 bg-purple-50/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                WFH Remote
              </span>
              <Home size={11} className="text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-xl font-black text-slate-900">
                {wfh.left.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">Days</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {wfh.used.toFixed(1)} used / {wfh.allotted.toFixed(0)} total
            </div>
          </div>
          <div className="w-full bg-purple-200/80 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${wfhPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ACTIVE REQUEST Subcard */}
      {activeReq ? (
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
      ) : (
        <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 text-center text-xs text-slate-400">
          No pending time off requests
        </div>
      )}
    </div>
  );
}
