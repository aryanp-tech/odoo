// src/components/employee/AssignedCustodyAssetsCard.jsx
// Clean Assigned Assets card with hardware tags & quick action

import React from 'react';
import { Laptop, Monitor, KeyRound, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssignedCustodyAssetsCard({ assets = [] }) {
  const getAssetIcon = (type) => {
    if (type === 'monitor') return Monitor;
    if (type === 'key') return KeyRound;
    return Laptop;
  };

  const handleSupport = () => {
    toast.success('IT support request created');
  };

  return (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4.5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Laptop size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              Assigned Equipment
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSupport}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
        >
          <Wrench size={12} className="text-slate-400" />
          <span>Support</span>
        </button>
      </div>

      {/* Asset Items */}
      <div className="space-y-2">
        {assets.map((ast) => {
          const Icon = getAssetIcon(ast.type);
          return (
            <div
              key={ast.id}
              className="p-3 rounded-xl border border-[#e2e8f0] hover:border-slate-300 bg-white transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8.5 h-8.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {ast.title}
                    </h4>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {ast.badge || 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {ast.spec || 'Hardware Verified'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
