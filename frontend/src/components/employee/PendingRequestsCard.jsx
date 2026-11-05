// src/components/employee/PendingRequestsCard.jsx
// Pending Requests & Approvals card with status pills

import React from 'react';
import { Plane, Receipt, Clock, ArrowRight } from 'lucide-react';

export default function PendingRequestsCard({ requests = [] }) {
  const getIcon = (type) => {
    if (type === 'leave') return Plane;
    if (type === 'expense') return Receipt;
    return Clock;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Pending Requests & Approvals
            </h3>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
              {requests.length} In Progress
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Submitted leaves, expense receipts & hardware tickets
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {requests.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-[#e2e8f0] hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left Item Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                    {item.dateRange} • Approver:{' '}
                    <span className="text-slate-600 font-semibold">
                      {item.approver}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Status Pill & Elapsed Time */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                    item.statusStyle || 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-1">
                  {item.submittedTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

