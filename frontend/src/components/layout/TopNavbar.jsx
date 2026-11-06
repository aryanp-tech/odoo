// src/components/layout/TopNavbar.jsx
// Clean Top Navigation Header with Profile Dropdown, Role Badge, and Sign Out

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredSession, clearSession } from '../../services/authService';

export default function TopNavbar({ user }) {
  const navigate = useNavigate();
  const sessionUser = user || getStoredSession();
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

      {/* 2. User Profile with Dropdown */}
      <div className="relative pl-3 border-l border-slate-200" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group text-left"
        >
          {sessionUser?.photo ? (
            <img
              src={sessionUser.photo}
              alt={sessionUser.name}
              className="w-8.5 h-8.5 rounded-xl object-cover shadow-xs shrink-0 ring-2 ring-transparent group-hover:ring-indigo-200 transition-all"
            />
          ) : (
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-[#2563eb] to-[#4338ca] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 ring-2 ring-transparent group-hover:ring-indigo-200 transition-all">
              {sessionUser?.avatar_initials || 'AP'}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{sessionUser?.name || 'Aryan Patel'}</span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </div>
            <div className="text-[10px] font-semibold text-slate-400 leading-tight mt-0.5">
              {sessionUser?.job_title || 'Software Engineer'}
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-900 truncate">
                {sessionUser?.name || 'Aryan Patel'}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {sessionUser?.email || 'aryan.p@latitudetechnolabs.org'}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
                <Shield size={10} />
                <span>{sessionUser?.roleLabel || 'Super Admin / Core Tech'}</span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-1">
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
