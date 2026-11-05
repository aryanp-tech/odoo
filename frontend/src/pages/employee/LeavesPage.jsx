// src/pages/employee/LeavesPage.jsx
// Leaves & Time Off page with View Switcher: Approval Tracker & Calendar View

import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import LeavesCalendarView from '../../components/employee/LeavesCalendarView';
import ApplyLeaveModal from '../../components/employee/ApplyLeaveModal';
import { useGetEmployeeDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  Calendar as CalendarIcon,
  Plus,
  Table,
  UserCheck,
  ShieldCheck,
  Home,
  HeartPulse,
  Sparkles,
} from 'lucide-react';

export default function LeavesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Default tab is 'table' (Approval Tracker first), toggleable to 'calendar'
  const [activeTab, setActiveTab] = useState('table');

  const user = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery();

  // Quotas matching the user's reference mockup:
  // 1/3 Days Casual Leave 2026 | 5/6 Days Work From Home | 3/3 Days Sick Leave 2026
  const quotas = [
    {
      id: 'casual',
      title: 'Casual Leave 2026',
      fraction: '1 / 3 Days',
      takenText: '2 taken (Expire on 12/31/2026)',
      cardBg: 'bg-[#fffbeb] border-[#fde68a]',
      accentColor: 'text-amber-900',
      fractionColor: 'text-amber-800',
      icon: Sparkles,
      iconBg: 'bg-amber-100 text-amber-700',
      progressPct: 33,
      progressColor: 'bg-amber-500',
    },
    {
      id: 'wfh',
      title: 'Work From Home',
      fraction: '5 / 6 Days',
      takenText: '1 taken (Expire on 12/31/2026)',
      cardBg: 'bg-[#faf5ff] border-[#e9d5ff]',
      accentColor: 'text-purple-900',
      fractionColor: 'text-purple-800',
      icon: Home,
      iconBg: 'bg-purple-100 text-purple-700',
      progressPct: 83,
      progressColor: 'bg-purple-600',
    },
    {
      id: 'sick',
      title: 'Sick Leave 2026',
      fraction: '3 / 3 Days',
      takenText: '0 taken (Expire on 12/31/2026)',
      cardBg: 'bg-[#f0fdf4] border-[#bbf7d0]',
      accentColor: 'text-emerald-900',
      fractionColor: 'text-emerald-800',
      icon: HeartPulse,
      iconBg: 'bg-emerald-100 text-emerald-700',
      progressPct: 100,
      progressColor: 'bg-emerald-600',
    },
  ];

  // Request History with Manager and HR approval statuses
  const leaveHistory = [
    {
      id: 'lv-1',
      title: 'Going to village',
      type: 'Casual Leave 2026',
      dateRange: 'Nov 09, 2026',
      days: 1.0,
      managerApprover: 'Sarah Chen (Lead)',
      managerStatus: 'Approved',
      hrApprover: 'HR Operations',
      hrStatus: 'Approved',
      overallStatus: 'Approved',
    },
    {
      id: 'lv-2',
      title: 'going home',
      type: 'Casual Leave 2026',
      dateRange: 'Nov 12, 2026',
      days: 1.0,
      managerApprover: 'Sarah Chen (Lead)',
      managerStatus: 'Approved',
      hrApprover: 'HR Operations',
      hrStatus: 'Pending HR Approval',
      overallStatus: 'Pending HR Approval',
    },
    {
      id: 'lv-3',
      title: 'Request WFM cause Going Out of Station',
      type: 'Work From Home',
      dateRange: 'Nov 13, 2026',
      days: 1.0,
      managerApprover: 'Sarah Chen (Lead)',
      managerStatus: 'Approved',
      hrApprover: 'HR Operations',
      hrStatus: 'Approved',
      overallStatus: 'Approved',
    },
    {
      id: 'lv-4',
      title: 'Christmas Vacation & Family Holiday',
      type: 'Casual Leave 2026',
      dateRange: 'Dec 24, 2026 - Dec 26, 2026',
      days: 3.0,
      managerApprover: 'Sarah Chen (Lead)',
      managerStatus: 'Pending Review',
      hrApprover: 'HR Operations',
      hrStatus: 'Pending HR Approval',
      overallStatus: 'Pending HR Approval',
    },
  ];

  // Helper for pristine, non-wrapping status badges with colored indicator dots and crisp borders
  const renderStatusPill = (status, approver, align = 'start') => {
    const isApproved = status === 'Approved' || status === 'Fully Approved';
    const isRejected = status === 'Rejected';

    return (
      <div className={`flex flex-col ${align === 'end' ? 'items-end' : 'items-start'} gap-0.5`}>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 border shadow-2xs leading-none ${
            isApproved
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isRejected
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isApproved
                ? 'bg-emerald-500'
                : isRejected
                ? 'bg-rose-500'
                : 'bg-amber-500'
            }`}
          />
          <span>{status}</span>
        </span>
        {approver && (
          <span className="text-[10px] text-slate-400 font-medium pl-1 whitespace-nowrap">
            {approver}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      {/* 1. Sidebar Navigation */}
      <Sidebar activeTab="leaves" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-4 md:p-5 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4">
            {/* Header: Title, View Switcher Buttons & Request Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Leaves &amp; Time Off Portal
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Track leave allocations, company holiday schedules, and approval statuses
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher Buttons (Approval Tracker & Calendar) */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'table'
                        ? 'bg-[#4338ca] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Table size={14} />
                    <span>Approval Tracker</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'calendar'
                        ? 'bg-[#4338ca] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CalendarIcon size={14} />
                    <span>Calendar View</span>
                  </button>
                </div>

                {/* Request Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Request Time Off</span>
                </button>
              </div>
            </div>

            {/* Top 3 Quota Cards (Sleek & Compact) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quotas.map((q) => {
                const Icon = q.icon;
                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${q.cardBg}`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${q.iconBg}`}>
                            <Icon size={13} />
                          </div>
                          <span className={`text-[11px] font-bold uppercase tracking-wider ${q.accentColor}`}>
                            {q.title}
                          </span>
                        </div>
                      </div>

                      {/* Fraction Display: e.g. 1 / 3 Days */}
                      <div className="flex items-baseline gap-1 my-1">
                        <span className={`text-2xl font-black tracking-tight ${q.fractionColor}`}>
                          {q.fraction}
                        </span>
                      </div>

                      {/* Subtext: 2 taken (Expire on 12/31/2026) */}
                      <p className="text-[10px] font-medium text-slate-500">
                        {q.takenText}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/80 border border-slate-200/50 h-1.5 rounded-full overflow-hidden mt-2.5 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${q.progressColor}`}
                        style={{ width: `${q.progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tab 1: Approval Tracker Table */}
            {activeTab === 'table' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Table size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                        My Time Off Requests &amp; Approval Tracker
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Manager review &amp; HR authorization status pipeline
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                    {leaveHistory.length} Total Submissions
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs whitespace-nowrap min-w-[840px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                        <th className="py-3.5 px-4 font-bold">Request Title</th>
                        <th className="py-3.5 px-4 font-bold">Type</th>
                        <th className="py-3.5 px-4 font-bold">Scheduled Date</th>
                        <th className="py-3.5 px-4 font-bold">Duration</th>
                        <th className="py-3.5 px-4 font-bold">
                          <span className="flex items-center gap-1.5">
                            <UserCheck size={13} className="text-indigo-600" />
                            <span>Manager Approval</span>
                          </span>
                        </th>
                        <th className="py-3.5 px-4 font-bold">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <span>HR Operations</span>
                          </span>
                        </th>
                        <th className="py-3.5 px-4 font-bold text-right">Overall Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {leaveHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                            {item.title}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap shadow-2xs ${
                                item.type === 'Work From Home'
                                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                                  : item.type === 'Sick Leave 2026'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  item.type === 'Work From Home'
                                    ? 'bg-purple-600'
                                    : item.type === 'Sick Leave 2026'
                                    ? 'bg-emerald-600'
                                    : 'bg-amber-500'
                                }`}
                              />
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {item.dateRange}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                            {item.days} Day{item.days > 1 ? 's' : ''}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderStatusPill(item.managerStatus, item.managerApprover)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderStatusPill(item.hrStatus, item.hrApprover)}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            {renderStatusPill(item.overallStatus, null, 'end')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Monthly Leaves & Holidays Calendar */}
            {activeTab === 'calendar' && (
              <div>
                <LeavesCalendarView onRequestLeave={() => setIsModalOpen(true)} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interactive Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
