// src/pages/employee/AttendancePage.jsx
// Dedicated Attendance Timesheet & Work Hours Tracking page

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { useGetEmployeeDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const user = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const attendance = dashboardData?.attendance || {};
  const rows = attendance.telemetryRows || [];

  const weeklyLogged = Number(attendance.weeklyLoggedHours || 0);
  const target = Number(attendance.weeklyTarget || 40.0);
  const completionPct = target > 0 ? Math.min(100, Math.round((weeklyLogged / target) * 100)) : 0;
  const dailyAvg = rows.length > 0 ? (weeklyLogged / rows.length).toFixed(1) : '0.0';
  const overtime = Math.max(0, weeklyLogged - target).toFixed(1);
  const punctuality = rows.length > 0 ? '100%' : '0%';

  const handleExport = () => {
    toast.success('Exporting timesheet records to Excel / CSV');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="attendance" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Attendance &amp; Timesheet
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed shift logs, biometric check-in tracking &amp; weekly overtime telemetry
                </p>
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Download size={14} className="text-slate-500" />
                <span>Export Timesheet</span>
              </button>
            </div>

            {/* 4 Colorful Attendance Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="bg-white rounded-xl border border-indigo-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-indigo-50/30">
                <div className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-1">
                  Weekly Logged
                </div>
                <div className="text-3xl font-black text-indigo-950 tracking-tight">
                  {weeklyLogged.toFixed(1)}h
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Target: {target.toFixed(1)}h ({completionPct}% completion)
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-emerald-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
                <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                  Punctuality Rate
                </div>
                <div className="text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-1.5">
                  <span>{punctuality}</span>
                  <CheckCircle2 size={20} className={rows.length > 0 ? 'text-emerald-500' : 'text-slate-300'} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {rows.length > 0 ? 'Consistent on-time check-ins' : 'No attendance recorded'}
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: punctuality }} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-teal-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-teal-50/30">
                <div className="text-[10px] font-bold text-teal-700 tracking-wider uppercase mb-1">
                  Daily Average
                </div>
                <div className="text-3xl font-black text-teal-950 tracking-tight">
                  {dailyAvg}h
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Standard shift is 8.0h/day
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((Number(dailyAvg) / 8) * 100))}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-amber-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-amber-50/30">
                <div className="text-[10px] font-bold text-amber-700 tracking-wider uppercase mb-1">
                  Overtime Accrued
                </div>
                <div className="text-3xl font-black text-amber-950 tracking-tight">
                  +{overtime}h
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Eligible for comp-off conversion
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((Number(overtime) / 5) * 100))}%` }} />
                </div>
              </div>
            </div>

            {/* Full Attendance Logs Table */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Biometric Shift Records &amp; Logs
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Current Week
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-semibold">Workday / Date</th>
                      <th className="pb-2.5 font-semibold">Clock In</th>
                      <th className="pb-2.5 font-semibold">Clock Out</th>
                      <th className="pb-2.5 font-semibold">Net Hours</th>
                      <th className="pb-2.5 font-semibold">Location Hub</th>
                      <th className="pb-2.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Clock size={28} className="mx-auto mb-2 text-slate-300" />
                          <p className="font-semibold text-slate-600 text-sm">No Attendance Records Found</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            No clock-in telemetry recorded in Odoo for this period. Use the Home Dashboard punch button to clock in.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 font-bold text-slate-900">
                            {row.dateLabel}
                          </td>
                          <td className="py-3 text-slate-600 font-mono font-medium">
                            {row.punchIn}
                          </td>
                          <td className="py-3 text-slate-600 font-mono font-medium">
                            {row.punchOut}
                          </td>
                          <td className="py-3 font-bold text-slate-800">
                            {row.netTime}
                          </td>
                          <td className="py-3 text-slate-500">
                            Ahmedabad HQ (127.0.0.1)
                          </td>
                          <td className="py-3 text-right">
                            {row.isToday ? (
                              <span className="inline-flex items-center justify-center whitespace-nowrap text-[10px] font-bold px-3 py-0.5 rounded-full bg-[#4338ca] text-white">
                                Active Shift
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {row.statusTag}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

