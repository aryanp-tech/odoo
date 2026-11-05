// src/pages/employee/ProfilePage.jsx
// Comprehensive Employee 360 Dossier & Organizational Profile page

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { useGetEmployeeDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Briefcase,
  Calendar,
  GraduationCap,
  Award,
  Users,
  FileCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const user = dashboardData?.user || getStoredSession();

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="profile" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto space-y-4.5">
            {/* Header Hero Card */}
            <div className="bg-gradient-to-r from-indigo-50/90 via-violet-50/40 to-white rounded-xl border border-indigo-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4.5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-xl shadow-md ring-4 ring-white shrink-0">
                  {user.avatar_initials || 'AP'}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      {user.name || 'Aryan Patel'}
                    </h1>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Employee
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {user.job_title || 'Software Engineer'} • {user.department || 'Core Platform Engineering Group'}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-slate-400" />
                      {user.email || 'aryan.p@latitudetechnolabs.org'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {user.location || 'Munich Tech Center'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  Badge: {user.badge_id || '6APX-77402'}
                </span>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organizational Hierarchy */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Building size={16} className="text-indigo-600" />
                  <span>Organizational Hierarchy</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Direct Reporting Manager</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">Sarah Chen</span>
                      <span className="text-slate-500 text-[11px]">Engineering Lead • Core Platform Group</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      Manager
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Department</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">Engineering &amp; Cloud Systems</span>
                      <span className="text-slate-500 text-[11px]">Division: Platform Engineering</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Work Schedule</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">Standard Shift (09:00 - 17:00 CET)</span>
                      <span className="text-slate-500 text-[11px]">40h standard working week • Hybrid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Accreditations */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-3.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Award size={16} className="text-teal-600" />
                  <span>Technical Skills &amp; Qualifications</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Core Competencies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Python / Odoo 14', 'React 19 / Vite', 'PostgreSQL', 'Docker & Kubernetes', 'System Architecture', 'REST & JSON-RPC'].map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Certifications</span>
                    <p className="font-semibold text-slate-800">
                      Odoo Certified Technical Developer • AWS Solutions Architect Associate
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Emergency Contact</span>
                    <p className="font-semibold text-slate-800">
                      Parent / Guardian • +49 89 2345 6789 (Munich Emergency Registry)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

