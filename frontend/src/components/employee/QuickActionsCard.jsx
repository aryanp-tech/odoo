// src/components/employee/QuickActionsCard.jsx
// Clean Quick Actions & Shortcuts for core operational modules

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  FileSpreadsheet,
  Laptop,
  LifeBuoy,
  Layers,
} from 'lucide-react';

export default function QuickActionsCard({ onRequestLeave }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff]/60 to-[#e9d5ff]/40 border border-[#e9d5ff] rounded-2xl p-6 shadow-xs">
      {/* 1. Card Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-purple-200/60">
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7c3aed] flex items-center justify-center shrink-0">
          <Layers size={16} />
        </div>
        <h3 className="text-sm font-bold text-slate-900 leading-tight">
          Quick Actions
        </h3>
      </div>

      {/* 2. 2x2 Clean Action Tiles */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Tile 1: Apply Leave (Navigates directly to Leaves Page) */}
        <button
          type="button"
          onClick={() => navigate('/leaves')}
          className="p-4 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col items-start gap-2 group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <CalendarPlus size={16} />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
            Apply Leave
          </div>
        </button>

        {/* Tile 2: Log Timesheet */}
        <button
          type="button"
          onClick={() => navigate('/timesheets')}
          className="p-4 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col items-start gap-2 group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet size={16} />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
            Log Timesheet
          </div>
        </button>

        {/* Tile 3: Hardware & Devices */}
        <button
          type="button"
          onClick={() => navigate('/assets')}
          className="p-4 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col items-start gap-2 group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Laptop size={16} />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors">
            Hardware &amp; Devices
          </div>
        </button>

        {/* Tile 4: Raise Support Ticket */}
        <button
          type="button"
          onClick={() => navigate('/tickets?tab=new')}
          className="p-4 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col items-start gap-2 group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <LifeBuoy size={16} />
          </div>
          <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
            Raise Ticket
          </div>
        </button>
      </div>
    </div>
  );
}
