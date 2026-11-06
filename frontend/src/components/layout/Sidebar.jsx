// src/components/layout/Sidebar.jsx
// Exact dark executive sidebar matching the user's reference mockup with Sign Out action

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Clock,
  FolderKanban,
  FileSpreadsheet,
  Award,
  Laptop,
  Vote,
  User,
  Settings,
  Layers,
  LifeBuoy,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredSession, clearSession } from '../../services/authService';

const HUB_ITEMS = [
  { id: 'overview', path: '/', label: 'My ESS Dashboard', icon: LayoutDashboard },
  { id: 'leaves', path: '/leaves', label: 'Leaves & Time Off', icon: CalendarCheck },
  { id: 'attendance', path: '/attendance', label: 'Attendance Timesheet', icon: Clock },
  { id: 'projects', path: '/projects', label: 'Projects', icon: FolderKanban },
  { id: 'timesheets', path: '/timesheets', label: 'Timesheets', icon: FileSpreadsheet },
  { id: 'performance', path: '/performance', label: 'Quarterly Review', icon: Award },
];

const WORKPLACE_ITEMS = [
  { id: 'assets', path: '/assets', label: 'My Office Equipment', icon: Laptop },
  { id: 'tickets', path: '/tickets', label: 'Tickets & Helpdesk', icon: LifeBuoy },
  { id: 'voting', path: '/voting', label: 'Office Pulse Polls', icon: Vote },
  { id: 'profile', path: '/profile', label: 'Employee Profile', icon: User },
];

export default function Sidebar({ activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getStoredSession();

  const handleSignOut = () => {
    clearSession();
    toast.success('Successfully signed out');
    navigate('/login', { replace: true });
  };

  const getIsActive = (item) => {
    if (activeTab) {
      if (item.id === 'overview' && activeTab === 'overview') return true;
      if (item.id === 'tickets' && (activeTab === 'tickets' || activeTab === 'infrastructure')) return true;
      return activeTab === item.id;
    }
    if (item.path === '/') return location.pathname === '/' || location.pathname === '/overview';
    if (item.id === 'tickets' && (location.pathname === '/tickets' || location.pathname === '/infrastructure')) return true;
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

        {/* Section 2: OPERATIONS & TOOLS */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            OPERATIONS &amp; TOOLS
          </div>
          {renderNavList(WORKPLACE_ITEMS)}
        </div>
      </div>

      {/* 3. User Session Footer & Sign Out */}
      <div className="p-3 border-t border-[#15203d] bg-[#070d1e]/50 flex items-center justify-between gap-2">
        <div 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
        >
          {sessionUser?.photo ? (
            <img
              src={sessionUser.photo}
              alt={sessionUser.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 shadow-xs ring-1 ring-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#4338ca] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {sessionUser?.avatar_initials || 'AP'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {sessionUser?.name || 'Aryan Patel'}
            </div>
            <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
              {sessionUser?.roleLabel || 'Super Admin'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
