// src/components/layout/Sidebar.jsx
// Exact executive dark sidebar matching reference mockup with real-time system status

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  Clock,
  CalendarCheck,
  FileSpreadsheet,
  FolderKanban,
  Award,
  LifeBuoy,
  CreditCard,
  Settings,
  Layers,
  LogOut,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredSession, clearSession } from '../../services/authService';

export default function Sidebar({ activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getStoredSession() || {};
  const role = sessionUser?.role || 'employee';

  const isSuperAdmin = role === 'super_admin';
  const isHrAdmin = role === 'hr_admin';

  const navItems = [
    { id: 'home', label: 'Home', path: isSuperAdmin ? '/admin' : '/', icon: Home },
    { id: 'profile', label: 'My Profile', path: '/profile', icon: User },
    { id: 'attendance', label: 'Attendance', path: '/attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', path: '/leaves', icon: CalendarCheck },
    { id: 'timesheets', label: 'Timesheets', path: '/timesheets', icon: FileSpreadsheet },
    { id: 'projects', label: 'Projects', path: '/projects', icon: FolderKanban },
    { id: 'performance', label: 'Performance', path: '/performance', icon: Award },
    { id: 'helpdesk', label: 'Helpdesk', path: '/tickets', icon: LifeBuoy },
    ...(isSuperAdmin || isHrAdmin
      ? [{ id: 'settings', label: isSuperAdmin ? 'Staff Management' : 'Settings', path: '/admin/employees', icon: Settings }]
      : []),
  ];

  const handleSignOut = () => {
    clearSession();
    toast.success('Successfully signed out');
    navigate('/login', { replace: true });
  };

  const getIsActive = (item) => {
    if (activeTab) {
      if (item.id === 'home' && (activeTab === 'home' || activeTab === 'admin-overview' || activeTab === 'overview')) return true;
      if (item.id === 'settings' && (activeTab === 'settings' || activeTab === 'admin-employees')) return true;
      if (item.id === 'helpdesk' && (activeTab === 'helpdesk' || activeTab === 'tickets')) return true;
      return activeTab === item.id;
    }
    if (item.path === '/admin') return location.pathname === '/admin';
    if (item.path === '/') return location.pathname === '/' || location.pathname === '/overview';
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <aside className="w-60 bg-[#0d1326] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none border-r border-[#17213d]">
      {/* 1. Clean Company Branding (No extra subtitles) */}
      <div 
        onClick={() => navigate(isSuperAdmin ? '/admin' : '/')}
        className="h-16 px-5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-[#17213d]"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#6366f1] text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
          <Layers size={20} strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-black text-white tracking-tight leading-tight truncate">
            Latitude Techno Labs
          </h1>
        </div>
      </div>

      {/* 2. Main Navigation List */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white font-bold shadow-md shadow-indigo-500/25'
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
      </div>

      {/* 3. Bottom System Operational Status Card */}
      <div className="p-3 border-t border-[#17213d] bg-[#090e1f]">
        <div className="p-2.5 rounded-xl bg-[#131c38] border border-[#1b2b52] flex items-center gap-2.5 mb-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20 shrink-0"></span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight">System Online</div>
            <div className="text-[9px] text-emerald-400 font-medium leading-tight mt-0.5">All Systems Operational</div>
          </div>
        </div>

        {/* User Mini Profile & Sign Out */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 min-w-0 flex-1 hover:bg-white/5 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {sessionUser.avatar_initials || 'AP'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {sessionUser.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate leading-tight">
                {sessionUser.roleLabel || (isSuperAdmin ? 'Super Admin' : 'Standard Employee')}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
