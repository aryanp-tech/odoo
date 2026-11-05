// src/components/PendingApprovals.jsx
import React, { useState } from 'react';
import { Check, X, Clock, FileCheck2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PendingApprovals({ approvals = [], roleName = "" }) {
  const [items, setItems] = useState(approvals);

  const handleAction = (id, type) => {
    alert(`${type === 'approve' ? 'Approved' : 'Rejected'} request #${id}`);
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <FileCheck2 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pending Approvals Queue
            </h3>
            <p className="text-[11px] text-slate-400">Action items awaiting review</p>
          </div>
        </div>

        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
          {items.length} Pending
        </span>
      </div>

      {/* List */}
      <div className="space-y-2.5 my-auto">
        {items.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-500" />
            <p className="font-semibold text-slate-600">All caught up!</p>
            <p className="text-[11px]">No pending items for this role queue.</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-slate-800">{item.user}</span>
                  <span className="text-[10px] bg-slate-200/70 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                    {item.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-tight">
                  {item.title}
                </p>
                <div className="flex items-center space-x-2 pt-0.5 text-[11px] text-slate-400">
                  <span className="flex items-center">
                    <Clock size={11} className="mr-1" />
                    {item.time}
                  </span>
                  <span>•</span>
                  <span className="text-amber-700 font-semibold">{item.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleAction(item.id, 'approve')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                  title="Approve"
                >
                  <Check size={12} strokeWidth={3} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleAction(item.id, 'reject')}
                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Reject"
                >
                  <X size={12} strokeWidth={2.5} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Standard SLA: 24 Hours</span>
        <button 
          onClick={() => alert('Opening full approval audit trail...')}
          className="text-purple-700 font-bold hover:underline"
        >
          View All Queue →
        </button>
      </div>

    </div>
  );
}
