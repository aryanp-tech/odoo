// src/components/layout/TopNavbar.jsx
// Clean Top Navigation Header containing only Profile and Notification

import React from 'react';
import { Bell } from 'lucide-react';

export default function TopNavbar({ user }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-end gap-4 sticky top-0 z-20 shadow-2xs">
      {/* 1. Notifications Bell */}
      <button
        type="button"
        title="Notifications"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
      >
        <Bell size={18} />
        <span className="w-2 h-2 rounded-full bg-indigo-600 absolute top-2 right-2 ring-2 ring-white"></span>
      </button>

      {/* 2. User Profile with Initials Avatar & Designation */}
      <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
        <div className="w-8.5 h-8.5 rounded-xl bg-[#4338ca] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
          {user?.avatar_initials || 'AP'}
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight">
            {user?.name || 'Aryan Patel'}
          </div>
          <div className="text-[10px] font-semibold text-slate-400 leading-tight mt-0.5">
            {user?.job_title || 'Software Engineer'}
          </div>
        </div>
      </div>
    </header>
  );
}
