// src/components/QuickActionGrid.jsx
import React from 'react';
import * as LucideIcons from 'lucide-react';

const COLOR_VARIANTS = {
  indigo: "bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border-indigo-200/80",
  purple: "bg-purple-50 hover:bg-purple-100/80 text-purple-700 border-purple-200/80",
  emerald: "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200/80",
  sky: "bg-sky-50 hover:bg-sky-100/80 text-sky-700 border-sky-200/80",
  amber: "bg-amber-50 hover:bg-amber-100/80 text-amber-800 border-amber-200/80",
  rose: "bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-200/80",
  teal: "bg-teal-50 hover:bg-teal-100/80 text-teal-700 border-teal-200/80",
  blue: "bg-blue-50 hover:bg-blue-100/80 text-blue-700 border-blue-200/80",
  pink: "bg-pink-50 hover:bg-pink-100/80 text-pink-700 border-pink-200/80"
};

export default function QuickActionGrid({ actions = [], onActionClick }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
          Quick Actions & Shortcuts
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">
          Role Commands
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map((act, idx) => {
          const IconComp = LucideIcons[act.icon] || LucideIcons.Zap;
          const variant = COLOR_VARIANTS[act.color] || COLOR_VARIANTS.indigo;

          return (
            <button
              key={idx}
              onClick={() => onActionClick && onActionClick(act.action)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between group hover:shadow-2xs active:scale-[0.98] ${variant}`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/80 shadow-2xs flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <IconComp size={16} strokeWidth={2.3} />
              </div>
              <span className="text-xs font-bold leading-snug line-clamp-2">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
