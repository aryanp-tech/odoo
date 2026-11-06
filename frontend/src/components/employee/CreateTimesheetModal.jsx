// src/components/employee/CreateTimesheetModal.jsx
// Modal for filing daily work history and timesheets linked to company projects

import React, { useState } from 'react';
import { X, Clock, Folder, Send, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateTimesheetModal({
  isOpen,
  onClose,
  projects = [],
  selectedProject = '',
  onAddTimesheet,
}) {
  const [formData, setFormData] = useState(() => ({
    project: selectedProject || (projects[0]?.name || 'Act of Love react native'),
    task: '',
    date: new Date().toISOString().split('T')[0],
    hours: '08:00',
    description: '',
  }));

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.task.trim()) {
      toast.error('Please specify a task or ticket reference');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please describe your daily work history');
      return;
    }

    const newRecord = {
      id: `ts-${Date.now()}`,
      date: formData.date.split('-').reverse().join('/'),
      employee: 'Aryan Patel',
      project: formData.project,
      task: formData.task,
      description: formData.description,
      duration: formData.hours.includes(':') ? formData.hours : `${formData.hours.padStart(2, '0')}:00`,
      status: 'Sent',
    };

    if (onAddTimesheet) {
      onAddTimesheet(newRecord);
    }

    toast.success(`Timesheet sent to Manager & Project Leader for ${formData.project}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Daily Work History &amp; Timesheet
              </h3>
              <p className="text-[11px] text-slate-400">
                Record tasks and hours worked on company projects today
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Project Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Project *
            </label>
            <div className="relative">
              <select
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 outline-none transition-all cursor-pointer appearance-none"
              >
                {projects.map((proj) => (
                  <option key={proj.id || proj.name} value={proj.name}>
                    {proj.name} ({proj.taskCount || 0} Tasks)
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <Folder size={14} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Timesheet entries link directly to your assigned project ledger
            </p>
          </div>

          {/* Task and Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Task / Ticket Subject *
              </label>
              <input
                type="text"
                name="task"
                value={formData.task}
                onChange={handleChange}
                placeholder="e.g. Worked on Jira Tickets, UI Bugfixes"
                required
                className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Duration (Hours) *
              </label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                placeholder="e.g. 08:00 or 04:00"
                required
                className="w-full bg-[#f8fafc] text-xs font-mono font-medium text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 outline-none"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Work Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 outline-none"
              />
            </div>
          </div>

          {/* Description (Daily Work History) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Daily Work History / Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail what you accomplished today (e.g. Responded to Jira tickets and provided updates. Tested push notifications and deployed builds to staging...)"
              required
              className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 rounded-xl p-3 border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Attachment upload placeholder */}
          <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Paperclip size={14} />
              <span>Attach daily proof or PR link (optional)</span>
            </div>
            <span className="text-[10px] font-bold text-purple-700 cursor-pointer hover:underline">
              Browse file
            </span>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5b3c53] shadow-xs transition-all cursor-pointer"
            >
              <Send size={13} />
              <span>Submit &amp; Send to Manager</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
