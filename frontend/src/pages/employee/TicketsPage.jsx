// src/pages/employee/TicketsPage.jsx
// Company-wide Helpdesk & Ticket Generation Portal (HR, DevOps, IT, and General Inquiry)

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import CreateTicketModal from '../../components/employee/CreateTicketModal';
import TicketDetailsModal from '../../components/employee/TicketDetailsModal';
import {
  LifeBuoy,
  Plus,
  Search,
  Users,
  Terminal,
  Laptop,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Paperclip,
} from 'lucide-react';

const INITIAL_TICKETS = [
  {
    id: 'DEV-1089',
    department: 'DevOps',
    category: 'AWS / Cloud IAM & Credentials',
    priority: 'High',
    subject: 'Request access key & permissions for Omega Staging ECS cluster',
    description: '<p>Need IAM staging developer policy attached to run task definitions and verify Docker build containers for Omega Elevators release.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '04 Nov 2026',
    status: 'In Progress',
    attachments: [],
    activity: [
      {
        author: 'Aryan',
        date: '04 Nov 2026, 10:15 AM',
        message: 'Ticket created and routed to DevOps queue.',
      },
      {
        author: 'DevOps Lead',
        date: '04 Nov 2026, 11:30 AM',
        message: 'Assigned to DevOps engineering. Generating staging IAM role with session tokens.',
      },
    ],
  },
  {
    id: 'HR-1042',
    department: 'HR',
    category: 'HR Letter & Employment Verification',
    priority: 'Medium',
    subject: 'Request signed employment verification letter & Form 16',
    description: '<p>Require official signed employment verification certificate addressed to bank for residential documentation along with recent Form 16.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '02 Nov 2026',
    status: 'Resolved',
    attachment: 'salary_slip_oct2026.pdf',
    attachments: [
      {
        id: 'file-doc-1',
        name: 'salary_slip_oct2026.pdf',
        size: '240 KB',
        type: 'application/pdf',
        isImage: false,
        dataUrl: '#',
      },
    ],
    activity: [
      {
        author: 'Aryan',
        date: '02 Nov 2026, 09:30 AM',
        message: 'Ticket submitted to People Operations.',
      },
      {
        author: 'HR Operations',
        date: '03 Nov 2026, 04:15 PM',
        message: 'Letter generated with digital company stamp and emailed to your corporate address.',
      },
    ],
  },
  {
    id: 'GEN-1055',
    department: 'General',
    category: 'Office Facilities & Workstation',
    priority: 'Medium',
    subject: 'Workstation dual monitor arm mount & ergonomic chair inspection',
    description: '<p>Requesting an ergonomic chair height inspection and installation of a dual monitor VESA desk mount arm in bay 4.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '30 Oct 2026',
    status: 'Open',
    attachments: [],
    activity: [
      {
        author: 'Aryan',
        date: '30 Oct 2026, 11:45 AM',
        message: 'Ticket submitted to Facilities & General Operations desk.',
      },
    ],
  },
  {
    id: 'IT-1031',
    department: 'IT',
    category: 'External Monitor & Peripherals',
    priority: 'Low',
    subject: 'Dual 4K display USB-C to HDMI adapter replacement',
    description: '<p>Current multiport dongle has an intermittent video flicker when connected to Dell UltraSharp monitor in work bay 3.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '28 Oct 2026',
    status: 'In Progress',
    attachments: [],
    activity: [
      {
        author: 'Aryan',
        date: '28 Oct 2026, 02:20 PM',
        message: 'Ticket logged with IT Support desk.',
      },
      {
        author: 'IT Desk Admin',
        date: '29 Oct 2026, 11:00 AM',
        message: 'Hardware replacement requested from central stock. Expected delivery tomorrow.',
      },
    ],
  },
  {
    id: 'DEV-1025',
    department: 'DevOps',
    category: 'VPN & Network Gateway Access',
    priority: 'Medium',
    subject: 'Corporate IP whitelisting for client API integration endpoint',
    description: '<p>Need our static office outbound IP added to security groups for Act of Love react native staging backend.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '22 Oct 2026',
    status: 'Resolved',
    attachments: [],
    activity: [
      {
        author: 'Aryan',
        date: '22 Oct 2026, 11:00 AM',
        message: 'Submitted to DevOps queue.',
      },
      {
        author: 'DevOps Engineer',
        date: '22 Oct 2026, 01:45 PM',
        message: 'Outbound IP whitelisted in AWS Security Group rules.',
      },
    ],
  },
  {
    id: 'HR-1018',
    department: 'HR',
    category: 'Leave & Attendance Discrepancy',
    priority: 'Low',
    subject: 'Clarification regarding festival holiday calendar leave accrual',
    description: '<p>Checking annual leave balance calculation for the upcoming Diwali break in third week of November.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '14 Oct 2026',
    status: 'Resolved',
    attachments: [],
    activity: [
      {
        author: 'Aryan',
        date: '14 Oct 2026, 10:00 AM',
        message: 'Submitted inquiry to HR.',
      },
      {
        author: 'HR Operations',
        date: '15 Oct 2026, 11:20 AM',
        message: 'Confirmed leave accrual policy. Optional festival leaves are automatically allocated.',
      },
    ],
  },
  {
    id: 'IT-1007',
    department: 'IT',
    category: 'Laptop Hardware & Repair Issue',
    priority: 'Medium',
    subject: 'MacBook Pro thermal diagnostic & internal fan cleaning',
    description: '<p>Noticed elevated fan RPM and thermal throttling during heavy local build compilations.</p>',
    requester: 'Aryan',
    email: 'aryan.p@latitudetechnolabs.org',
    date: '08 Oct 2026',
    status: 'Resolved',
    attachments: [],
    activity: [
      {
        author: 'Aryan',
        date: '08 Oct 2026, 09:15 AM',
        message: 'Logged hardware check request.',
      },
      {
        author: 'IT Desk Admin',
        date: '08 Oct 2026, 03:00 PM',
        message: 'Hardware inspection performed. Fans cleared and thermal diagnostics passed.',
      },
    ],
  },
];

export default function TicketsPage() {
  const user = getStoredSession();
  const userName = user?.name || 'Aryan';

  // Load tickets with fallback to INITIAL_TICKETS
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('portal_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_TICKETS;
  });

  // Save to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem('portal_tickets', JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDept, setCreateDept] = useState('DevOps');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Filters
  const [activeDeptTab, setActiveDeptTab] = useState('ALL'); // ALL, HR, DevOps, IT, General
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Open, In Progress, Resolved
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Create Ticket
  const handleOpenCreateModal = (dept = 'DevOps') => {
    setCreateDept(dept);
    setIsCreateOpen(true);
  };

  const handleCreateTicket = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  // Handle Status Change
  const handleStatusChange = (ticketId, nextStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Department filter
      if (activeDeptTab !== 'ALL' && ticket.department !== activeDeptTab) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && ticket.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = ticket.id.toLowerCase().includes(q);
        const matchesSubject = ticket.subject.toLowerCase().includes(q);
        const matchesDesc = (ticket.description || '').toLowerCase().includes(q);
        const matchesCat = (ticket.category || '').toLowerCase().includes(q);
        const matchesReq = (ticket.requester || '').toLowerCase().includes(q);
        const matchesEmail = (ticket.email || '').toLowerCase().includes(q);
        if (!matchesId && !matchesSubject && !matchesDesc && !matchesCat && !matchesReq && !matchesEmail) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, activeDeptTab, statusFilter, priorityFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = tickets.length;
    const hrCount = tickets.filter((t) => t.department === 'HR').length;
    const devopsCount = tickets.filter((t) => t.department === 'DevOps').length;
    const itCount = tickets.filter((t) => t.department === 'IT').length;
    const generalCount = tickets.filter((t) => t.department === 'General').length;
    const openCount = tickets.filter((t) => t.status === 'Open').length;
    const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
    const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

    return { total, hrCount, devopsCount, itCount, generalCount, openCount, inProgressCount, resolvedCount };
  }, [tickets]);

  const renderDeptPill = (dept) => {
    if (dept === 'HR') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <Users size={12} /> HR
        </span>
      );
    }
    if (dept === 'DevOps') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
          <Terminal size={12} /> DevOps
        </span>
      );
    }
    if (dept === 'General') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
          <HelpCircle size={12} /> General
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap">
        <Laptop size={12} /> IT Support
      </span>
    );
  };

  const renderPriorityBadge = (p) => {
    if (p === 'Urgent') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Urgent</span>;
    }
    if (p === 'High') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">High</span>;
    }
    if (p === 'Medium') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">Medium</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
  };

  const renderStatusBadge = (s) => {
    if (s === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <Clock size={12} /> In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
        <AlertTriangle size={12} /> Open
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-[#f4f7fb] overflow-hidden font-sans antialiased text-slate-800">
      {/* 1. Sidebar */}
      <Sidebar activeTab="tickets" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopNavbar />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Helpdesk &amp; Support
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <LifeBuoy className="text-indigo-600" size={26} />
                Support Ticket Portal
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Generate and track service requests for HR, DevOps, IT, and General Inquiry
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCreateModal('DevOps')}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Generate Ticket</span>
            </button>
          </div>

          {/* Quick Department Cards (4-Column Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* HR Card */}
            <div className="bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 border border-rose-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                  {metrics.hrCount}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">HR Department</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  Salary slips, HR letters, leaves &amp; policies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal('HR')}
                className="w-full py-1.5 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Raise HR Ticket
              </button>
            </div>

            {/* DevOps Card */}
            <div className="bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/30 border border-indigo-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Terminal size={18} />
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                  {metrics.devopsCount}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">DevOps &amp; Cloud</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  AWS IAM, CI/CD, server SSH &amp; VPN gateway.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal('DevOps')}
                className="w-full py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Raise DevOps Ticket
              </button>
            </div>

            {/* IT Support Card */}
            <div className="bg-gradient-to-br from-sky-50/60 via-white to-sky-50/30 border border-sky-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Laptop size={18} />
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                  {metrics.itCount}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">IT Support</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  Laptops, displays, Wi-Fi &amp; software tools.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal('IT')}
                className="w-full py-1.5 text-xs font-bold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Raise IT Ticket
              </button>
            </div>

            {/* General Inquiry Card */}
            <div className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 border border-amber-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <HelpCircle size={18} />
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  {metrics.generalCount}
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">General Inquiry</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  Facilities, ID cards, travel &amp; general ops.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal('General')}
                className="w-full py-1.5 text-xs font-bold text-amber-800 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Raise General Ticket
              </button>
            </div>
          </div>

          {/* Department Filter Tabs & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Department Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveDeptTab('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeDeptTab === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({metrics.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeptTab('HR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDeptTab === 'HR'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users size={13} /> HR ({metrics.hrCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeptTab('DevOps')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDeptTab === 'DevOps'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Terminal size={13} /> DevOps ({metrics.devopsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeptTab('IT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDeptTab === 'IT'
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Laptop size={13} /> IT Support ({metrics.itCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeptTab('General')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDeptTab === 'General'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle size={13} /> General ({metrics.generalCount})
                </button>
              </div>

              {/* Status / Priority / Search Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="Open">Open ({metrics.openCount})</option>
                  <option value="In Progress">In Progress ({metrics.inProgressCount})</option>
                  <option value="Resolved">Resolved ({metrics.resolvedCount})</option>
                </select>

                {/* Priority Dropdown */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Search Input */}
                <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets..."
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Requester (Client)</th>
                    <th className="py-3 px-4">Subject &amp; Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <LifeBuoy size={32} className="mx-auto mb-2 opacity-40 text-indigo-500" />
                        <p className="font-semibold text-slate-600">No tickets match your filters</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try resetting search or change department tab</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const attachCount = (ticket.attachments?.length || 0) + (ticket.attachment ? 1 : 0);
                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                            #{ticket.id}
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4">
                            {renderDeptPill(ticket.department)}
                          </td>

                          {/* Requester / Client (From Profile) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900 leading-tight">
                              Client: {ticket.requester || 'Aryan'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[160px]">
                              {ticket.email || 'aryan.p@latitudetechnolabs.org'}
                            </div>
                          </td>

                          {/* Subject & Category */}
                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {ticket.subject}
                              </span>
                              {attachCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                                  <Paperclip size={10} /> {attachCount}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              {ticket.category}
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4">
                            {renderPriorityBadge(ticket.priority)}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                            {ticket.date}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            {renderStatusBadge(ticket.status)}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicket(ticket);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Details</span>
                              <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Showing {filteredTickets.length} of {tickets.length} total tickets</span>
              <span className="font-medium text-slate-600">Latitude Support SLA: HR 24h • DevOps 4h • IT 8h • General 12h</span>
            </div>
          </div>
        </main>
      </div>

      {/* 3. Create Ticket Modal */}
      <CreateTicketModal
        key={`${isCreateOpen}-${createDept}`}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialDepartment={createDept}
        onCreateTicket={handleCreateTicket}
        currentUser={userName}
      />

      {/* 4. Ticket Details Modal */}
      <TicketDetailsModal
        key={selectedTicket?.id}
        isOpen={Boolean(selectedTicket)}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusChange={handleStatusChange}
        currentUser={userName}
      />
    </div>
  );
}
