// src/components/employee/TimesheetDetailsModal.jsx
// Popup modal to view submitted timesheet details and the manager-to-project-leader routing timeline

import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  FolderKanban,
  Layers,
  Calendar,
  Briefcase,
  FileText,
  Send,
} from 'lucide-react';

export default function TimesheetDetailsModal({
  isOpen,
  onClose,
  timesheet,
}) {
  if (!isOpen || !timesheet) return null;

  const isSent = timesheet.status === 'Sent' || timesheet.status === 'Sended';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* 1. Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-[#714B67] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Timesheet Details &amp; Approval Timeline
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isSent ? 'Sent' : 'Draft'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Submitted daily work report and routing flow to Manager and Project Leader
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar size={12} /> Date
              </div>
              <div className="mt-1 font-bold text-slate-900">{timesheet.date}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock size={12} /> Duration
              </div>
              <div className="mt-1 font-mono font-bold text-slate-900">{timesheet.duration} hrs</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Briefcase size={12} /> Project
              </div>
              <div className="mt-1 font-bold text-purple-900 truncate" title={timesheet.project}>
                {timesheet.project}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Send size={12} /> Status
              </div>
              <div className="mt-1">
                {isSent ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 size={11} /> Sent
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    Pending Send
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Task Title & Employee */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Task / Activity</span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">{timesheet.task}</h4>
            </div>
            <div className="sm:text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee</span>
              <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                <div className="w-5 h-5 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-[9px]">
                  {timesheet.employee?.charAt(0) || 'A'}
                </div>
                <span className="font-bold text-slate-900">{timesheet.employee || 'Aryan Patel'}</span>
              </div>
            </div>
          </div>

          {/* Work Description History */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              Daily Work History Description
            </h4>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed">
              {timesheet.description}
            </div>
          </div>

          {/* Manager to Project Leader Routing Timeline */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers size={14} className="text-purple-600" />
              Approval &amp; Routing Workflow
            </h4>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Step 1: Employee Submission */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      1. Timesheet Sent by Employee
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Filed by <span className="font-semibold text-slate-700">{timesheet.employee || 'Aryan Patel'}</span> on {timesheet.date} ({timesheet.duration} hrs logged)
                  </p>
                </div>
              </div>

              {/* Step 2: Reporting Manager */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                  <UserCheck size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      2. Sent to Reporting Manager
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      Sent for Review
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assigned to <span className="font-semibold text-slate-700">Reporting Manager (Amit Trivedi)</span> for attendance verification &amp; workday validation
                  </p>
                </div>
              </div>

              {/* Step 3: Project Leader */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                  <FolderKanban size={12} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      3. Routed to Project Leader
                    </span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                      Routed to Lead
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Forwarded to <span className="font-semibold text-slate-700">{timesheet.project} Project Leader</span> for milestone deliverables &amp; task verification
                  </p>
                </div>
              </div>

              {/* Step 4: Odoo Project Analytic Line */}
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center ring-4 ring-white shadow-xs">
                  <Layers size={11} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 text-xs">
                      4. Odoo Analytic Ledger Entry
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                      Scheduled Sync
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Auto-consolidates into Odoo <code className="text-slate-600 bg-slate-100 px-1 rounded">account.analytic.line</code> for client billable reporting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Timesheet sent to Manager &amp; Project Leader</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

