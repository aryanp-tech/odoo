// src/components/layout/Sidebar.jsx
// Exact dark executive sidebar matching the user's reference mockup

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  FolderKanban,
  Award,
  Laptop,
  Server,
  Vote,
  User,
  Settings,
  Layers,
} from 'lucide-react';

const HUB_ITEMS = [
  { id: 'overview', path: '/', label: 'My ESS Dashboard', icon: LayoutDashboard },
  { id: 'leaves', path: '/leaves', label: 'Leaves & Time Off', icon: CalendarCheck },
  { id: 'attendance', path: '/attendance', label: 'Attendance Timesheet', icon: Clock },
  { id: 'project-timesheets', path: '/project-timesheets', label: 'Project Timesheets', icon: FolderKanban },
  { id: 'performance', path: '/performance', label: 'Quarterly Review', icon: Award },
];

const WORKPLACE_ITEMS = [
  { id: 'assets', path: '/assets', label: 'My Office Equipment', icon: Laptop },
  { id: 'infrastructure', path: '/infrastructure', label: 'IT & Infrastructure', icon: Server },
  { id: 'voting', path: '/voting', label: 'Office Pulse Polls', icon: Vote },
  { id: 'profile', path: '/profile', label: 'Employee Profile', icon: User },
  { id: 'settings', path: '/settings', label: 'System Settings', icon: Settings },
];

export default function Sidebar({ activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getIsActive = (item) => {
    if (activeTab) {
      if (item.id === 'overview' && activeTab === 'overview') return true;
      return activeTab === item.id;
    }
    if (item.path === '/') return location.pathname === '/' || location.pathname === '/overview';
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const renderNavList = (items) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = getIsActive(item);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer text-left ${
              isActive
                ? 'bg-gradient-to-r from-[#2563eb] to-[#4f46e5] text-white font-bold shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <Icon
              size={17}
              className={isActive ? 'text-white' : 'text-slate-400'}
              strokeWidth={2}
            />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <aside className="w-64 bg-[#0b1329] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none border-r border-[#15203d]">
      {/* 1. Brand Header with Layered Stack Icon */}
      <div 
        onClick={() => navigate('/')}
        className="h-16 px-5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-[#15203d]"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#2563eb] to-[#06b6d4] text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
          <Layers size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-black text-white tracking-tight leading-tight truncate">
            Latitude Techno Labs
          </h1>
          <p className="text-[10px] font-bold text-[#06b6d4] truncate mt-0.5">
            Enterprise Workplace
          </p>
        </div>
      </div>

      {/* 2. Navigation Sections */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-5">
        {/* Section 1: EMPLOYEE HUB */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            EMPLOYEE HUB
          </div>
          {renderNavList(HUB_ITEMS)}
        </div>

        {/* Section 2: WORKPLACE & OPERATIONS */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            WORKPLACE &amp; OPERATIONS
          </div>
          {renderNavList(WORKPLACE_ITEMS)}
        </div>
      </div>
    </aside>
  );
}
