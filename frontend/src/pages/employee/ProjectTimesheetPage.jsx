// src/pages/employee/ProjectTimesheetPage.jsx
// Dedicated Project Timesheets & Task Allocation tracking page

import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import {
  FolderKanban,
  Clock,
  Plus,
  TrendingUp,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectTimesheetPage() {
  const user = getStoredSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskData, setTaskData] = useState({
    project: 'ERP Modernization',
    task: '',
    hours: 4,
    date: new Date().toISOString().split('T')[0],
  });

  const [timesheets, setTimesheets] = useState([
    {
      id: 'ts-1',
      project: 'ERP Cloud Modernization',
      projectColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      task: 'Core JSON-RPC ORM Engine & Session Binding',
      hours: 8.5,
      billable: 'Billable (100%)',
      date: 'Today, Nov 05',
    },
    {
      id: 'ts-2',
      project: 'Modern React Frontend Portal',
      projectColor: 'bg-teal-50 text-teal-700 border-teal-200',
      task: 'Employee Self-Service (ESS) Reactive Dashboard',
      hours: 8.0,
      billable: 'Billable (100%)',
      date: 'Yesterday, Nov 04',
    },
    {
      id: 'ts-3',
      project: 'Biometric Attendance Bridge',
      projectColor: 'bg-sky-50 text-sky-700 border-sky-200',
      task: 'Live Punch In/Out Sync & Geolocation Controller',
      hours: 7.5,
      billable: 'Internal Platform',
      date: 'Mon, Nov 03',
    },
    {
      id: 'ts-4',
      project: 'Security & Infrastructure',
      projectColor: 'bg-purple-50 text-purple-700 border-purple-200',
      task: 'FIDO2 Hardware Key (YubiKey 5C) & VPN Gateway',
      hours: 8.0,
      billable: 'Billable (100%)',
      date: 'Fri, Oct 31',
    },
  ]);

  const handleLogTask = (e) => {
    e.preventDefault();
    if (!taskData.task) {
      toast.error('Please enter a task description');
      return;
    }
    const newTs = {
      id: `ts-${Date.now()}`,
      project: taskData.project,
      projectColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      task: taskData.task,
      hours: Number(taskData.hours),
      billable: 'Billable (100%)',
      date: 'Today, Nov 05',
    };
    setTimesheets([newTs, ...timesheets]);
    toast.success(`Logged ${taskData.hours}h to ${taskData.project}!`);
    setIsModalOpen(false);
    setTaskData({ project: 'ERP Modernization', task: '', hours: 4, date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="project-timesheets" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Project Timesheets &amp; Task Allocation
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track project hours, task deliverables &amp; client billable utilization
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Log Task Hours</span>
              </button>
            </div>

            {/* 3 Colorful Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#f8f9ff] rounded-xl border border-indigo-200/80 p-4.5 shadow-xs">
                <div className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-1">
                  Total Project Hours
                </div>
                <div className="text-3xl font-black text-indigo-950 tracking-tight">
                  32.0h
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Logged across 4 engineering deliverables this week
                </p>
              </div>

              <div className="bg-[#f0fdf4] rounded-xl border border-emerald-200/80 p-4.5 shadow-xs">
                <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                  Billable Utilization
                </div>
                <div className="text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <span>92%</span>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Exceeding 85% client billability benchmark
                </p>
              </div>

              <div className="bg-[#f0f9ff] rounded-xl border border-sky-200/80 p-4.5 shadow-xs">
                <div className="text-[10px] font-bold text-sky-700 tracking-wider uppercase mb-1">
                  Active Projects
                </div>
                <div className="text-3xl font-black text-sky-950 tracking-tight">
                  03
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ERP Cloud, ESS Portal &amp; Biometric Bridge
                </p>
              </div>
            </div>

            {/* Timesheets Table */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Task Time Allocation Log
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {timesheets.length} Tasks Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-semibold">Project</th>
                      <th className="pb-2.5 font-semibold">Task Description</th>
                      <th className="pb-2.5 font-semibold">Date</th>
                      <th className="pb-2.5 font-semibold">Logged Hours</th>
                      <th className="pb-2.5 font-semibold text-right">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {timesheets.map((ts) => (
                      <tr key={ts.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ts.projectColor}`}>
                            {ts.project}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          {ts.task}
                        </td>
                        <td className="py-3 text-slate-500">
                          {ts.date}
                        </td>
                        <td className="py-3 font-extrabold text-slate-900 font-mono">
                          {ts.hours}h
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {ts.billable}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Log Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Log Project Task Hours
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project
                </label>
                <select
                  value={taskData.project}
                  onChange={(e) => setTaskData({ ...taskData, project: e.target.value })}
                  className="w-full bg-[#f8fafc] text-xs font-semibold rounded-xl p-2.5 border border-slate-200"
                >
                  <option value="ERP Cloud Modernization">ERP Cloud Modernization</option>
                  <option value="Modern React Frontend Portal">Modern React Frontend Portal</option>
                  <option value="Biometric Attendance Bridge">Biometric Attendance Bridge</option>
                  <option value="Security & Infrastructure">Security &amp; Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Developed JSON-RPC Client"
                  value={taskData.task}
                  onChange={(e) => setTaskData({ ...taskData, task: e.target.value })}
                  className="w-full bg-[#f8fafc] text-xs font-semibold rounded-xl p-2.5 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hours Logged
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="16"
                    required
                    value={taskData.hours}
                    onChange={(e) => setTaskData({ ...taskData, hours: e.target.value })}
                    className="w-full bg-[#f8fafc] text-xs font-semibold rounded-xl p-2.5 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskData.date}
                    onChange={(e) => setTaskData({ ...taskData, date: e.target.value })}
                    className="w-full bg-[#f8fafc] text-xs font-semibold rounded-xl p-2.5 border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3]"
                >
                  Log Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

