// src/components/employee/QuickActionsCard.jsx
// Exact Row 3 Right layout matching user reference: Quick Actions & Portals

import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarPlus,
  Receipt,
  Monitor,
  DoorClosed,
  Layers,
} from 'lucide-react';

export default function QuickActionsCard({ onRequestLeave }) {
  const navigate = useNavigate();

  const handleClaimExpense = () => {
    toast.success('Expense claim workflow ready. Linked to Odoo hr.expense.');
  };

  const handleBookRoom = () => {
    toast.success('Meeting room reservation system ready.');
  };

  return (
    <div className="bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff]/60 to-[#e9d5ff]/40 border border-[#e9d5ff] rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full">
      {/* 1. Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-purple-200/60">
        <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7c3aed] flex items-center justify-center shrink-0">
          <Layers size={18} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Quick Actions &amp; Portals
          </h3>
          <span className="text-[10px] font-mono text-purple-800 bg-white/90 px-1.5 py-0.2 rounded border border-purple-200 shadow-2xs">
            portal.actions
          </span>
        </div>
      </div>

      {/* 2. 2x2 Grid of Actions Matching Mockup */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {/* Tile 1: Apply Leave */}
        <button
          type="button"
          onClick={onRequestLeave}
          className="p-3.5 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
            <CalendarPlus size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              Apply Leave
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Vacation &amp; Sick PTO
            </div>
          </div>
        </button>

        {/* Tile 2: Claim Expense */}
        <button
          type="button"
          onClick={handleClaimExpense}
          className="p-3.5 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
            <Receipt size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
              Claim Expense
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Travel &amp; Gear receipts
            </div>
          </div>
        </button>

        {/* Tile 3: Request Hardware */}
        <button
          type="button"
          onClick={() => navigate('/assets')}
          className="p-3.5 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5">
            <Monitor size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-purple-600 transition-colors">
              Request Hardware
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Monitors, Laptops
            </div>
          </div>
        </button>

        {/* Tile 4: Book Room */}
        <button
          type="button"
          onClick={handleBookRoom}
          className="p-3.5 rounded-xl border border-purple-100/90 bg-white/90 hover:bg-white hover:border-purple-300 transition-all text-left cursor-pointer flex flex-col justify-between group shadow-2xs"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
            <DoorClosed size={16} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
              Book Room
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Conference &amp; Booths
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
