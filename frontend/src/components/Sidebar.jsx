// src/components/Sidebar.jsx
import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Timer,
  Award,
  Laptop,
  Megaphone,
  Vote,
  Settings,
  ChevronRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ROLES_CONFIG } from '../data/rolesData';

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { id: "employees", label: "Employees (360)", icon: Users, badge: "150" },
  { id: "attendance", label: "Attendances (ZK)", icon: Clock },
  { id: "leaves", label: "Leaves & Time Off", icon: CalendarDays, badge: "4" },
  { id: "timesheets", label: "Timesheets", icon: Timer },
  { id: "appraisal", label: "Appraisal & PMS", icon: Award },
  { id: "custody", label: "Custody (Assets)", icon: Laptop },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "voting", label: "Employee Voting", icon: Vote },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ currentRoleKey, onSelectRole, isOpen, onToggle }) {
  const role = ROLES_CONFIG[currentRoleKey] || ROLES_CONFIG.employee;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 select-none shadow-2xs z-30 transition-all duration-200 h-screen sticky top-0">
      
      {/* 1. BRAND HEADER */}
      <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#714B67] to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
            LT
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">SquadFocus</span>
              <span className="text-[9px] font-bold bg-purple-50 text-[#714B67] border border-purple-200 px-1 py-0.2 rounded">
                v18
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Latitude Technolabs</p>
          </div>
        </div>
      </div>

      {/* 2. ROLE PERSONA SELECTOR CARD */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/70">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Active Role Persona</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <div className="relative">
          <select
            value={currentRoleKey}
            onChange={(e) => onSelectRole(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none hover:border-purple-300 focus:border-[#714B67] transition cursor-pointer shadow-2xs"
          >
            <option value="super_admin">1. Super Admin</option>
            <option value="hr_admin">2. HR Administrator</option>
            <option value="hr_officer">3. HR Officer</option>
            <option value="manager">4. Manager / Team Leader</option>
            <option value="employee">5. Employee (ESS)</option>
            <option value="it_admin">6. IT Administrator</option>
            <option value="it_officer">7. IT Officer</option>
            <option value="recruiter">8. Recruiter / BDE</option>
            <option value="project_manager">9. Project Manager</option>
          </select>
        </div>

        <div className="mt-2 flex items-center space-x-2 px-1">
          <img
            src={role.user.avatar}
            alt={role.user.name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-purple-200"
          />
          <div className="truncate">
            <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
              {role.user.name}
            </span>
            <span className="text-[10px] text-slate-500 truncate block">
              {role.user.title}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CORE NAVIGATION LINKS */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Modules
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "dashboard";

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== "dashboard") {
                  alert(`Navigating to ${item.label}...`);
                }
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-purple-50 text-[#714B67] font-bold shadow-2xs border border-purple-100"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  size={16}
                  className={isActive ? "text-[#714B67]" : "text-slate-400"}
                  strokeWidth={isActive ? 2.3 : 2}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-[#714B67] text-white"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. FOOTER STATUS BAR */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-700">ZK 4370 Synced</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">v18.0.4</span>
      </div>

    </aside>
  );
}
