// src/components/HeaderNavbar.jsx
import React from 'react';
import { Search, Bell, Clock, ChevronDown, LayoutGrid, Download, ExternalLink, Layers, Sparkles } from 'lucide-react';
import { ROLES_CONFIG } from '../data/rolesData';

export default function HeaderNavbar({
  currentRoleKey,
  onSelectRole,
  isCanvasView,
  onToggleCanvasView,
  onOpenFigmaExport
}) {
  const currentRole = ROLES_CONFIG[currentRoleKey] || ROLES_CONFIG.employee;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none sticky top-0 z-40 shadow-xs">
      
      {/* Left: Branding & Role Dropdown */}
      <div className="flex items-center space-x-3.5">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#714B67] to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
            LT
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900">SquadFocus</span>
              <span className="text-[10px] font-bold bg-purple-50 text-[#714B67] border border-purple-200 px-1.5 py-0.2 rounded tracking-wide">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none hidden sm:block">Latitude Technolabs</p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

        {/* 🌟 9-ROLE SELECTOR DROPDOWN */}
        <div className="relative">
          <div className="flex items-center bg-slate-50 hover:bg-slate-100/80 rounded-xl px-2.5 py-1.5 border border-slate-200 transition cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 hidden sm:inline">Role:</span>
            <select
              value={currentRoleKey}
              onChange={(e) => onSelectRole(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
            >
              <option value="super_admin">1. Super Admin (Executive)</option>
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
        </div>

      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex flex-1 max-w-md mx-6">
        <div className="w-full relative group">
          <input
            type="text"
            placeholder="Search employees, leaves, assets, payroll, tickets (Ctrl+K)..."
            className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 border border-slate-200 rounded-xl text-xs px-3 py-2 pl-9 text-slate-800 placeholder-slate-400 outline-none transition shadow-2xs"
          />
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="text-[10px] bg-slate-200/70 text-slate-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </span>
        </div>
      </div>

      {/* Right Controls: Figma Tools + Timer + Notifications + Profile */}
      <div className="flex items-center space-x-2 text-xs">
        
        {/* Figma Canvas Multi-Board Switcher */}
        <button
          onClick={onToggleCanvasView}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-2xs ${
            isCanvasView
              ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-100"
              : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
          }`}
          title="Toggle Figma Canvas Multi-Dashboard View"
        >
          <LayoutGrid size={14} />
          <span className="hidden md:inline">{isCanvasView ? "Single Board" : "Figma Multi-Board"}</span>
        </button>

        {/* Figma Export Button */}
        <button
          onClick={onOpenFigmaExport}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-[#714B67] border border-purple-200 transition cursor-pointer shadow-2xs"
          title="Export Figma Specs & SVG Tokens"
        >
          <Sparkles size={14} className="text-purple-600" />
          <span className="hidden sm:inline">Export Figma</span>
        </button>

        {/* Live Punch Status Button */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl font-bold font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>03:42:18</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => alert('Notifications: 2 Pending Tasks for this user.')}
          className="w-9 h-9 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center justify-center relative transition cursor-pointer text-slate-600"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <img
            src={currentRole.user.avatar}
            alt={currentRole.user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
          />
          <div className="text-left hidden xl:block">
            <div className="font-bold text-slate-900 text-xs leading-none">{currentRole.user.name}</div>
            <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{currentRole.user.title}</div>
          </div>
        </div>

      </div>

    </header>
  );
}
