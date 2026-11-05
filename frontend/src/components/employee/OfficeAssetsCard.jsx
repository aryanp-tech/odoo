// src/components/employee/OfficeAssetsCard.jsx
// Assigned hardware equipment, monitors & keycard badge

import React from 'react';
import { Laptop, Monitor, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OfficeAssetsCard({ assets = [] }) {
  const getIcon = (type) => {
    if (type === 'laptop') return Laptop;
    if (type === 'monitor') return Monitor;
    return CreditCard;
  };

  const handleReportLost = (assetName) => {
    toast(`Reported ${assetName} to IT Department`, {
      icon: '🛡️',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              My Office Assets
            </h3>
            <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              asset.details
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Assigned hardware & building access credentials
          </p>
        </div>
      </div>

      {/* Asset Items */}
      <div className="space-y-3">
        {assets.map((asset) => {
          const Icon = getIcon(asset.type);
          const isAction = asset.meta === 'Report Lost';

          return (
            <div
              key={asset.id}
              className="p-3.5 rounded-xl border border-[#e2e8f0] hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-800 truncate">
                      {asset.name}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                        asset.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {asset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                    {asset.tag} •{' '}
                    <span className="text-slate-600 font-medium">
                      {asset.specs}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Meta or Action */}
              <div className="shrink-0 text-right">
                {isAction ? (
                  <button
                    type="button"
                    onClick={() => handleReportLost(asset.name)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-red-500 hover:underline transition-colors cursor-pointer"
                  >
                    {asset.meta}
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400">
                    {asset.meta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

