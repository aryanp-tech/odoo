// src/components/layout/TopNavbar.jsx
// Clean Top Navigation Header matching reference mockup with Notification Badge & User Profile

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, User, LogOut, ChevronDown, ShieldAlert, Users, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredSession, clearSession } from '../../services/authService';

export default function TopNavbar({ user }) {
  const navigate = useNavigate();
  const sessionUser = user || getStoredSession() || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearSession();
    toast.success('Successfully signed out');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-end gap-5 sticky top-0 z-20 shadow-2xs">
      {/* 1. Notifications Bell */}
      <button
        type="button"
        title="Notifications"
        onClick={() => toast('No unread system alerts')}
        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors relative cursor-pointer"
      >
        <Bell size={17} />
      </button>

      {/* 2. User Profile with Dropdown */}
      <div className="relative pl-2" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group text-left"
        >
          {sessionUser?.photo ? (
            <img
              src={sessionUser.photo}
              alt={sessionUser.name}
              className="w-9 h-9 rounded-full object-cover shadow-xs shrink-0 ring-2 ring-indigo-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {sessionUser?.avatar_initials || sessionUser?.name?.slice(0, 2)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{sessionUser?.name || 'User'}</span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </div>
            {sessionUser?.job_title && (
              <div className="text-[11px] font-semibold text-slate-400 leading-tight mt-0.5">
                {sessionUser.job_title}
              </div>
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-900 truncate">
                {sessionUser?.name || 'User'}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {sessionUser?.email || ''}
              </div>
              {sessionUser?.roleLabel && (
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                  <span>{sessionUser.roleLabel}</span>
                </div>
              )}
            </div>

            {/* Menu Links */}
            <div className="py-1">
              {sessionUser?.role === 'super_admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    <ShieldAlert size={15} className="text-indigo-600" />
                    <span>Executive Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/employees"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Users size={15} className="text-slate-400" />
                    <span>Manage Workforce</span>
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                </>
              )}
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                <User size={15} className="text-slate-400" />
                <span>My Profile</span>
              </Link>
            </div>

            {/* Sign Out Button */}
            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
              >
                <LogOut size={15} className="text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
