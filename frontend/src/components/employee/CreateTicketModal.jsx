// src/components/employee/CreateTicketModal.jsx
// Modal for generating support tickets to HR, DevOps, IT, and General Inquiry departments

import React, { useState } from 'react';
import {
  X,
  Send,
  Users,
  Terminal,
  Laptop,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
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
    colorClass: 'border-rose-200 bg-rose-50/70 text-rose-700 hover:border-rose-400',
    activeClass: 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/40',
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
    colorClass: 'border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:border-indigo-400',
    activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-400/40',
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
    colorClass: 'border-sky-200 bg-sky-50/70 text-sky-700 hover:border-sky-400',
    activeClass: 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-400/40',
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
    colorClass: 'border-amber-200 bg-amber-50/70 text-amber-800 hover:border-amber-400',
    activeClass: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-400/40',
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

export default function CreateTicketModal({
  isOpen,
  onClose,
  initialDepartment = 'DevOps',
  onCreateTicket,
  currentUser,
}) {
  const sessionUser = getStoredSession();
  const clientName = currentUser || sessionUser?.name || 'Aryan';
  const clientEmail = sessionUser?.email || 'aryan.p@latitudetechnolabs.org';
  const avatarInitials = sessionUser?.avatar_initials || 'AP';

  const [selectedDept, setSelectedDept] = useState(initialDepartment);
  const [category, setCategory] = useState(() => {
    const deptObj = DEPARTMENTS.find((d) => d.id === initialDepartment) || DEPARTMENTS[1];
    return deptObj.categories[0];
  });
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);

  // When selectedDept changes, update category to first valid option
  const handleDepartmentChange = (deptId) => {
    setSelectedDept(deptId);
    const deptObj = DEPARTMENTS.find((d) => d.id === deptId);
    if (deptObj && deptObj.categories.length > 0) {
      setCategory(deptObj.categories[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error('Please enter a ticket subject');
      return;
    }
    // Check plain text or HTML content
    const cleanDesc = description.replace(/<[^>]*>/g, '').trim();
    if (!cleanDesc && !description.trim()) {
      toast.error('Please provide ticket details / description');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix =
      selectedDept === 'HR'
        ? 'HR'
        : selectedDept === 'DevOps'
        ? 'DEV'
        : selectedDept === 'IT'
        ? 'IT'
        : 'GEN';
    const newId = `${prefix}-${randomSuffix}`;

    const newTicket = {
      id: newId,
      department: selectedDept,
      category,
      priority,
      subject: subject.trim(),
      description: description.trim(),
      requester: clientName,
      email: clientEmail,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Open',
      attachments,
      activity: [
        {
          author: clientName,
          date: 'Just now',
          message: 'Ticket created and routed to team queue.',
        },
      ],
    };

    if (onCreateTicket) {
      onCreateTicket(newTicket);
    }

    toast.success(`Ticket #${newId} submitted to ${selectedDept} team!`);
    // Reset form
    setSubject('');
    setDescription('');
    setAttachments([]);
    onClose();
  };

  if (!isOpen) return null;

  const currentDeptObj = DEPARTMENTS.find((d) => d.id === selectedDept) || DEPARTMENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#15203d] to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Generate Support Ticket</h2>
              <p className="text-xs text-slate-300">Submit an operational request to HR, DevOps, IT, or General Inquiry</p>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Requester / Profile Header (Comes from profile) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                {avatarInitials}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <div>
                  <span className="text-slate-400 font-medium">Client: </span>
                  <span className="font-bold text-slate-900">{clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email: </span>
                  <span className="font-bold text-indigo-600">{clientEmail}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shrink-0 w-fit">
              From Profile
            </span>
          </div>

          {/* Step 1: Select Target Department / Inquiry */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Destination Department / Inquiry <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleDepartmentChange(dept.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected ? dept.activeClass : dept.colorClass
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center shrink-0">
                        <Icon size={15} />
                      </div>
                      {isSelected && <CheckCircle2 size={15} className="text-emerald-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{dept.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5 leading-snug line-clamp-1">{dept.subtext}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                {currentDeptObj.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Priority Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`py-2 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                          : `${p.pillClass} hover:opacity-90`
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 3: Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              4. Ticket Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                selectedDept === 'HR'
                  ? 'e.g. Form 16 request & updated tax declaration'
                  : selectedDept === 'DevOps'
                  ? 'e.g. Request AWS staging access key for Omega Elevators'
                  : selectedDept === 'IT'
                  ? 'e.g. Second monitor HDMI display adapter replacement'
                  : 'e.g. Workstation desk relocation & RFID access card activation'
              }
              className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Step 4: Rich Text Description & File Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              5. Details / Description &amp; Reference Files <span className="text-rose-500">*</span>
            </label>
            <RichTextEditorWithDropzone
              value={description}
              onChange={setDescription}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="Details on the reason(s) for opening the ticket."
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <AlertCircle size={14} />
            <span>Routed to {selectedDept} team queue</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Submit Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
