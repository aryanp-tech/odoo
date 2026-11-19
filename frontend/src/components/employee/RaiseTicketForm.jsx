// src/components/employee/RaiseTicketForm.jsx
// Full-page Component for Generating Support Tickets (No Pop-ups/Modals)

import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  Users,
  Terminal,
  Laptop,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  LifeBuoy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStoredSession } from '../../services/authService';
import RichTextEditorWithDropzone from './RichTextEditorWithDropzone';

const DEPARTMENTS = [
  {
    id: 'HR',
    label: 'HR Department',
    subtext: 'Payroll, Leaves, Benefits & Policy',
    icon: Users,
    colorClass: 'border-rose-200 bg-rose-50/50 text-rose-700 hover:border-rose-300 hover:bg-rose-50/80',
    activeClass: 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/40 shadow-xs',
    categories: [
      'Payroll & Salary Slip Query',
      'HR Letter & Employment Verification',
      'Leave & Attendance Discrepancy',
      'Health Insurance & Medical Benefits',
      'Company Policy & Grievance',
      'General HR Inquiry',
    ],
  },
  {
    id: 'DevOps',
    label: 'DevOps & Cloud',
    subtext: 'AWS/GCP, CI/CD, Servers & SSH',
    icon: Terminal,
    colorClass: 'border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/80',
    activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-400/40 shadow-xs',
    categories: [
      'AWS / Cloud IAM & Credentials',
      'CI/CD & Deployment Pipeline',
      'Server Access & SSH Keys',
      'GitLab / GitHub Repository Access',
      'VPN & Network Gateway Access',
      'General DevOps Request',
    ],
  },
  {
    id: 'IT',
    label: 'IT Support',
    subtext: 'Laptops, Monitors, Wi-Fi & Licenses',
    icon: Laptop,
    colorClass: 'border-sky-200 bg-sky-50/50 text-sky-700 hover:border-sky-300 hover:bg-sky-50/80',
    activeClass: 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-400/40 shadow-xs',
    categories: [
      'Laptop Hardware & Repair Issue',
      'External Monitor & Peripherals',
      'Software License & Tool Installation',
      'Office Wi-Fi & LAN Network',
      'Google Workspace & Email Setup',
      'General IT Support',
    ],
  },
  {
    id: 'General',
    label: 'General Inquiry',
    subtext: 'Facilities, Admin, Travel & Operations',
    icon: HelpCircle,
    colorClass: 'border-amber-200 bg-amber-50/50 text-amber-800 hover:border-amber-300 hover:bg-amber-50/80',
    activeClass: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400/40 shadow-xs',
    categories: [
      'General Workplace Inquiry',
      'Office Facilities & Workstation',
      'ID Card & Access Gate Pass',
      'Travel, Accommodation & Food',
      'Administrative Support & Logistics',
      'Feedback & Operational Suggestion',
    ],
  },
];

const PRIORITIES = [
  { id: 'Low', label: 'Low', pillClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Medium', label: 'Medium', pillClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'High', label: 'High', pillClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'Urgent', label: 'Urgent', pillClass: 'bg-rose-50 text-rose-700 border-rose-300' },
];

export default function RaiseTicketForm({
  initialDepartment = 'DevOps',
  onBack,
  onSubmitTicket,
  currentUser,
}) {
  const sessionUser = getStoredSession();
  const clientName = currentUser || sessionUser?.name || 'Employee';
  const clientEmail = sessionUser?.email || '';
  const avatarInitials = sessionUser?.avatar_initials || sessionUser?.name?.slice(0, 2)?.toUpperCase() || 'EM';

  const [selectedDept, setSelectedDept] = useState(initialDepartment);
  const [category, setCategory] = useState(() => {
    const deptObj = DEPARTMENTS.find((d) => d.id === initialDepartment) || DEPARTMENTS[1];
    return deptObj.categories[0];
  });
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDepartmentChange = (deptId) => {
    setSelectedDept(deptId);
    const deptObj = DEPARTMENTS.find((d) => d.id === deptId);
    if (deptObj && deptObj.categories.length > 0) {
      setCategory(deptObj.categories[0]);
    }
  };

  const currentDeptObj = DEPARTMENTS.find((d) => d.id === selectedDept) || DEPARTMENTS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter a ticket subject');
      return;
    }

    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    if (!cleanDesc && !description.trim()) {
      toast.error('Please provide ticket details / description');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmitTicket) {
        await onSubmitTicket({
          department: selectedDept,
          category,
          priority,
          subject: subject.trim(),
          description: description.trim(),
          attachments,
        });
      }
    } catch (err) {
      console.error('Failed to submit ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to All Tickets</span>
          </button>
          <span className="text-slate-300">|</span>
          <div className="text-xs text-slate-500 font-medium">
            Helpdesk &amp; Support / <strong className="text-slate-900">Raise Ticket</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <LifeBuoy size={13} /> Odoo 14 Live Helpdesk
          </span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Card Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-[#15203d] to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs shrink-0">
              <LifeBuoy size={22} className="text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Raise Support Ticket
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Directly route operational or technical requests to HR, DevOps, IT Support, or General Inquiry
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-7">
          {/* Requester Identity Strip */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">{clientName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Authenticated Employee
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {clientEmail || 'Internal Employee Account'}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold text-slate-400 block">Department</span>
              <span className="text-xs font-bold text-indigo-700">
                {sessionUser?.department || 'LatitudeTechnoLabs'}
              </span>
            </div>
          </div>

          {/* Section 1: Department Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Select Support Department</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Choose the destination team</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentChange(dept.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected ? dept.activeClass : dept.colorClass
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-2xs flex items-center justify-center shrink-0">
                        <Icon size={18} />
                      </div>
                      {isSelected ? (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300"></span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight text-slate-900">{dept.label}</div>
                      <div className="text-[11px] opacity-75 mt-1 leading-snug">{dept.subtext}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                2. Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
              >
                {currentDeptObj.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                3. Priority Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`py-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs scale-[1.02]'
                          : `${p.pillClass} hover:border-slate-300 hover:bg-slate-50`
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              4. Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                selectedDept === 'HR'
                  ? 'e.g. Form 16 request & updated tax declaration'
                  : selectedDept === 'DevOps'
                  ? 'e.g. Request cloud infrastructure access'
                  : selectedDept === 'IT'
                  ? 'e.g. Second monitor HDMI display adapter replacement'
                  : 'e.g. Workstation desk relocation & RFID access card activation'
              }
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Section 4: Rich Text Description & File Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                5. Detailed Description &amp; Attachments <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Supports formatting, code snippets, logs, screenshots, and files
              </span>
            </div>
            <RichTextEditorWithDropzone
              value={description}
              onChange={setDescription}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="Provide a clear description of the issue or request. Attach screenshots or error logs if applicable."
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <AlertCircle size={15} className="text-indigo-600 shrink-0" />
              <span>
                Ticket will be logged in Odoo 14 and routed to the <strong>{selectedDept}</strong> queue.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'Submitting to Odoo...' : 'Submit Support Ticket'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
