// src/pages/employee/LeavesPage.jsx
// Leaves & Time Off page with View Switcher: Time Off Requests & Calendar View

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import LeavesCalendarView from '../../components/employee/LeavesCalendarView';
import ApplyLeaveModal from '../../components/employee/ApplyLeaveModal';
import { useGetEmployeeDashboardQuery, callOdooKw } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  Calendar as CalendarIcon,
  Plus,
  Table,
  Home,
  HeartPulse,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeavesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('table');
  const [isLoading, setIsLoading] = useState(true);

  const user = getStoredSession();

  // Dynamic live quotas & requests from Odoo backend
  const [quotas, setQuotas] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);

  const loadLeavesData = async () => {
    setIsLoading(true);
    try {
      const stored = getStoredSession();
      const empId = stored.employee_id || 3;

      // 1. Fetch real allocations
      const allocations = await callOdooKw('hr.leave.allocation', 'search_read', [[['employee_id', '=', empId]]], {
        fields: ['name', 'holiday_status_id', 'number_of_days', 'state'],
      }) || [];

      // 2. Fetch real leaves
      const leaves = await callOdooKw('hr.leave', 'search_read', [[['employee_id', '=', empId]]], {
        fields: ['id', 'holiday_status_id', 'number_of_days', 'request_date_from', 'request_date_to', 'state', 'name', 'notes'],
        order: 'create_date desc',
      }) || [];

      // 3. Fetch real leave types
      const types = await callOdooKw('hr.leave.type', 'search_read', [[]], {
        fields: ['id', 'name'],
      }) || [];

      // Build live quotas
      let totalPaidAllocated = 0;
      let totalSickAllocated = 0;
      let totalWfhAllocated = 0;
      allocations.forEach((a) => {
        const tname = (a.holiday_status_id ? a.holiday_status_id[1] : a.name || '').toLowerCase();
        if (tname.includes('wfh') || tname.includes('work from home') || tname.includes('remote') || tname.includes('compensatory')) {
          totalWfhAllocated += Number(a.number_of_days) || 0;
        } else if (tname.includes('sick')) {
          totalSickAllocated += Number(a.number_of_days) || 0;
        } else if (tname.includes('paid') || tname.includes('casual')) {
          totalPaidAllocated += Number(a.number_of_days) || 0;
        }
      });

      // Baseline policy: Every employee has 3 Casual, 3 Sick, 6 WFH
      if (totalPaidAllocated === 0) totalPaidAllocated = 3;
      if (totalSickAllocated === 0) totalSickAllocated = 3;
      if (totalWfhAllocated === 0) totalWfhAllocated = 6;

      let totalPaidTaken = 0;
      let totalSickTaken = 0;
      let totalWfhTaken = 0;
      leaves.forEach((l) => {
        const tname = (l.holiday_status_id ? l.holiday_status_id[1] : '').toLowerCase();
        if (l.state === 'validate' || l.state === 'confirm') {
          if (tname.includes('wfh') || tname.includes('work from home') || tname.includes('remote') || tname.includes('compensatory')) {
            totalWfhTaken += Number(l.number_of_days) || 0;
          } else if (tname.includes('sick')) {
            totalSickTaken += Number(l.number_of_days) || 0;
          } else {
            totalPaidTaken += Number(l.number_of_days) || 0;
          }
        }
      });

      const calculatedQuotas = [
        {
          id: 'paid',
          title: 'Casual Time Off 2026',
          fraction: `${Math.max(0, totalPaidAllocated - totalPaidTaken)} / ${totalPaidAllocated} Days`,
          takenText: `${totalPaidTaken} taken (3 Allotted / Year)`,
          cardBg: 'bg-[#fffbeb] border-[#fde68a]',
          accentColor: 'text-amber-900',
          fractionColor: 'text-amber-800',
          icon: Sparkles,
          iconBg: 'bg-amber-100 text-amber-700',
          progressPct: totalPaidAllocated > 0 ? Math.round(((totalPaidAllocated - totalPaidTaken) / totalPaidAllocated) * 100) : 0,
          progressColor: 'bg-amber-500',
        },
        {
          id: 'sick',
          title: 'Sick Time Off 2026',
          fraction: `${Math.max(0, totalSickAllocated - totalSickTaken)} / ${totalSickAllocated} Days`,
          takenText: `${totalSickTaken} taken (3 Allotted / Year)`,
          cardBg: 'bg-[#f0fdf4] border-[#bbf7d0]',
          accentColor: 'text-emerald-900',
          fractionColor: 'text-emerald-800',
          icon: HeartPulse,
          iconBg: 'bg-emerald-100 text-emerald-700',
          progressPct: totalSickAllocated > 0 ? Math.round(((totalSickAllocated - totalSickTaken) / totalSickAllocated) * 100) : 0,
          progressColor: 'bg-emerald-600',
        },
        {
          id: 'wfh',
          title: 'Work From Home (WFH) 2026',
          fraction: `${Math.max(0, totalWfhAllocated - totalWfhTaken)} / ${totalWfhAllocated} Days`,
          takenText: `${totalWfhTaken} taken (6 Allotted / Year)`,
          cardBg: 'bg-[#faf5ff] border-[#e9d5ff]',
          accentColor: 'text-purple-900',
          fractionColor: 'text-purple-800',
          icon: Home,
          iconBg: 'bg-purple-100 text-purple-700',
          progressPct: totalWfhAllocated > 0 ? Math.round(((totalWfhAllocated - totalWfhTaken) / totalWfhAllocated) * 100) : 0,
          progressColor: 'bg-purple-600',
        },
      ];
      setQuotas(calculatedQuotas);

      // Build live request history
      const formattedHistory = leaves.map((l) => {
        const typeName = l.holiday_status_id ? l.holiday_status_id[1] : 'Time Off';
        const start = l.request_date_from ? new Date(l.request_date_from).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '';
        const end = l.request_date_to ? new Date(l.request_date_to).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '';
        const dateRange = start === end || !end ? start : `${start} - ${end}`;
        const statusLabel = l.state === 'validate' ? 'Approved' : l.state === 'refuse' ? 'Rejected' : 'Pending';

        return {
          id: String(l.id),
          title: l.name || l.notes || `${typeName} Request`,
          type: typeName,
          dateRange: dateRange || '2026',
          rawDateFrom: l.request_date_from || (l.date_from ? l.date_from.split(' ')[0] : ''),
          days: Number(l.number_of_days) || 1.0,
          status: statusLabel,
        };
      });
      setLeaveHistory(formattedHistory);
    } catch (err) {
      console.warn('Failed to load live leaves from Odoo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeavesData();
  }, []);

  // Helper for pristine status badges with colored indicator dot and crisp border
  const renderStatusPill = (status, align = 'start') => {
    const isApproved = status === 'Approved' || status === 'Fully Approved';
    const isRejected = status === 'Rejected';

    return (
      <div className={`flex ${align === 'end' ? 'justify-end' : 'justify-start'}`}>
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
                  Track leave allocations, company holiday schedules, and time off status
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Switcher Buttons (Requests & Calendar) */}
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
                    <span>Time Off Requests</span>
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

            {/* Tab 1: Time Off Requests Table */}
            {activeTab === 'table' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Table size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                        My Time Off Requests
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Submitted applications and review status
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                    {leaveHistory.length} Total Submissions
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs whitespace-nowrap min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                        <th className="py-3.5 px-4 font-bold">Request Title</th>
                        <th className="py-3.5 px-4 font-bold">Type</th>
                        <th className="py-3.5 px-4 font-bold">Scheduled Date</th>
                        <th className="py-3.5 px-4 font-bold">Duration</th>
                        <th className="py-3.5 px-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium bg-white">
                      {leaveHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            <CalendarIcon size={28} className="mx-auto mb-2 text-slate-300" />
                            <p className="font-semibold text-slate-600 text-sm">No Time Off Requests Found</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              No leave applications have been submitted to Odoo yet. Click "Request Time Off" to apply.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        leaveHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-sm truncate">
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
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              {renderStatusPill(item.status, 'end')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Monthly Leaves & Holidays Calendar */}
            {activeTab === 'calendar' && (
              <div>
                <LeavesCalendarView leaves={leaveHistory} onRequestLeave={() => setIsModalOpen(true)} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interactive Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          loadLeavesData();
        }}
        onSuccess={loadLeavesData}
      />
    </div>
  );
}
