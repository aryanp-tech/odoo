// src/pages/superadmin/SuperAdminDashboardPage.jsx
// Exact executive Super Admin portal dashboard matching reference mockup with Chart.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { useGetSuperAdminDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';

// Chart.js & react-chartjs-2 integration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

import {
  Calendar,
  Clock,
  CheckSquare,
  Folder,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Zap,
  Info,
  ChevronDown,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const sessionUser = getStoredSession() || {};

  const { data: dashboardData, isLoading } = useGetSuperAdminDashboardQuery(undefined, {
    pollingInterval: 30000,
  });

  const [attendancePeriod, setAttendancePeriod] = useState('week'); // 'week' | 'month' | 'last_month'
  const [selectedRange, setSelectedRange] = useState('This Week');

  const user = dashboardData?.user || sessionUser;
  const attendance = dashboardData?.attendance || { percent: 0, isPresentToday: false, weeklyBarData: [0, 0, 0, 0, 0] };
  const leaveBalance = dashboardData?.leaveBalance || { totalDays: 0, carryForward: 0 };
  const tasks = dashboardData?.tasks || { totalCount: 0, overdueCount: 0 };
  const projects = dashboardData?.projects || { totalCount: 0, list: [] };
  const timesheet = dashboardData?.timesheet || { loggedHours: 0, requiredHours: 40, percent: 0, remainingHours: 40 };
  const upcomingLeaves = dashboardData?.upcomingLeaves || [];
  const recentActivities = dashboardData?.recentActivities || [];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Dynamic Mon - Fri labels for the current week
  const weekDayLabels = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((d, i) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      const mStr = dt.toLocaleDateString('en-US', { month: 'short' });
      return `${d}\n${mStr} ${dt.getDate()}`;
    });
  }, []);

  const weeklyPresent = attendance.weeklyBarData || [0, 0, 0, 0, 0];
  const weeklyAbsent = weeklyPresent.map((rate) => (rate > 0 ? Math.max(0, 100 - rate) : 0));
  const weeklyLate = [0, 0, 0, 0, 0];

  // Chart 1: Attendance Overview Bar Chart Configuration
  const barChartData = {
    labels: weekDayLabels,
    datasets: [
      {
        label: 'Present',
        data: weeklyPresent,
        backgroundColor: '#6366f1',
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.7,
      },
      {
        label: 'Absent',
        data: weeklyAbsent,
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
        barPercentage: 0.5,
        categoryPercentage: 0.7,
      },
      {
        label: 'Late',
        data: weeklyLate,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        barPercentage: 0.5,
        categoryPercentage: 0.7,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 10, weight: '600' },
          callback: function (val, index) {
            const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            return labels[index];
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#94a3b8',
          font: { size: 10 },
          callback: (value) => `${value}%`,
        },
        grid: {
          color: '#f1f5f9',
          drawBorder: false,
        },
      },
    },
  };

  // Chart 2: Timesheet Status Doughnut Chart Configuration
  const doughnutData = {
    labels: ['Logged', 'Remaining'],
    datasets: [
      {
        data: [timesheet.percent, Math.max(0, 100 - timesheet.percent)],
        backgroundColor: ['#6366f1', '#e2e8f0'],
        borderWidth: 0,
        cutout: '78%',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans antialiased">
      {/* 1. Dark Left Sidebar */}
      <Sidebar activeTab="admin-overview" />

      {/* 2. Main Executive Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-7 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Header Greeting Dossier */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#6366f1] text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-500/20 shrink-0">
                {user.avatar_initials || 'AP'}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Good morning, {user.name || 'Aryan Patel'}</span>
                  <span>👋</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Here's your dashboard overview for today, {todayFormatted}
                </p>
              </div>
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <CalendarDays size={14} className="text-slate-500" />
                <span>{selectedRange}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Row 1: 4 Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
            {/* Card 1: My Attendance */}
            <div className="bg-[#f0f7ff] border border-blue-100/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <Calendar size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">My Attendance</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {attendance.percent}%
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>{attendance.isPresentToday ? 'Present Today' : 'Not Checked In'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Leave Balance */}
            <div className="bg-[#f0fdf4] border border-emerald-100/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Leave Balance</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {leaveBalance.totalDays} Days
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs font-bold text-emerald-700">
                  <span>{leaveBalance.carryForward > 0 ? `+ ${leaveBalance.carryForward} Carry Forward` : 'Current Quota'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: My Tasks */}
            <div className="bg-[#fffbeb] border border-amber-100/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                    <CheckSquare size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">My Tasks</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {tasks.totalCount ?? 0}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                  <span>{tasks.overdueCount ?? 0} Overdue</span>
                </div>
              </div>
            </div>

            {/* Card 4: Active Projects */}
            <div className="bg-[#faf5ff] border border-purple-100/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
                    <Folder size={15} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Active Projects</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {projects.totalCount ?? 0}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Middle Section (Attendance Overview Chart & Upcoming Leaves) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Card (7 Cols): Attendance Overview Bar Chart */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              {/* Card Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Attendance Overview</h3>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAttendancePeriod('week')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      attendancePeriod === 'week'
                        ? 'bg-[#6366f1] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendancePeriod('month')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      attendancePeriod === 'month'
                        ? 'bg-[#6366f1] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendancePeriod('last_month')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      attendancePeriod === 'last_month'
                        ? 'bg-[#6366f1] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Last Month
                  </button>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mb-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></span>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                  <span>Late</span>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-60 w-full relative">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Right Card (5 Cols): Upcoming Leaves */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Upcoming Leaves</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/leaves')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Leaves List */}
              <div className="space-y-3.5 flex-1">
                {upcomingLeaves.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No upcoming leaves scheduled.
                  </div>
                ) : (
                  upcomingLeaves.slice(0, 3).map((leave) => (
                    <div
                      key={leave.id}
                      className="p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {leave.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {leave.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {leave.leaveType} • {leave.dateStr}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${leave.statusColor}`}
                      >
                        {leave.statusLabel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Bottom Section (Projects Progress, Timesheet Gauge, Recent Activity) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Column 1 (4 Cols): My Projects */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">My Projects</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                {projects.list && projects.list.length > 0 ? (
                  projects.list.slice(0, 2).map((proj) => (
                    <div key={proj.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          <span>{proj.name}</span>
                        </span>
                        <span className="font-bold text-slate-700">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#6366f1] rounded-full transition-all duration-300"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {proj.dueStr}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No active projects assigned.
                  </div>
                )}
              </div>
            </div>

            {/* Column 2 (4 Cols): Timesheet Status (Doughnut Gauge) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Timesheet Status</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/timesheets')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Gauge and Legend */}
              <div className="flex items-center justify-center gap-6 my-2">
                {/* Circular Chart */}
                <div className="w-32 h-32 relative flex items-center justify-center">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900 leading-tight">
                      {timesheet.percent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      This Week
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span>
                    <div>
                      <div className="text-slate-400 text-[10px] font-medium">Logged Hours</div>
                      <div className="font-bold text-slate-900">{timesheet.loggedHours} hrs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></span>
                    <div>
                      <div className="text-slate-400 text-[10px] font-medium">Required Hours</div>
                      <div className="font-bold text-slate-900">{timesheet.requiredHours} hrs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining Badge */}
              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-700">
                <Info size={14} className="text-indigo-600" />
                <span>{timesheet.remainingHours} hrs remaining this week</span>
              </div>
            </div>

            {/* Column 3 (4 Cols): Recent Activity */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/timesheets')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Activity Timeline List */}
              <div className="space-y-3.5 flex-1">
                {recentActivities.length > 0 ? (
                  recentActivities.map((act) => (
                    <div key={act.id} className="flex items-start justify-between gap-2.5 text-xs">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${act.color} mt-1.5 shrink-0`}></span>
                        <span className="text-slate-700 font-medium leading-relaxed truncate">
                          {act.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {act.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No recent activity recorded in backend.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
