// src/pages/employee/TicketsPage.jsx
// Company-wide Helpdesk & Ticket Generation Portal (HR, DevOps, IT, and General Inquiry)

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import { callOdooKw } from '../../services/api/apiSlice';
import RaiseTicketForm from '../../components/employee/RaiseTicketForm';
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
  RefreshCw,
  ListFilter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getStoredSession();
  const userName = user?.name || 'Employee';

  // Live tickets from Odoo backend
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state: 'list' (normal table view) or 'create' (full page Raise Ticket form)
  const isNewParam = searchParams.get('tab') === 'new' || searchParams.get('action') === 'create';
  const [viewMode, setViewMode] = useState(isNewParam ? 'create' : 'list');
  const [createDept, setCreateDept] = useState(searchParams.get('dept') || 'DevOps');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'new' || searchParams.get('action') === 'create') {
      setViewMode('create');
      if (searchParams.get('dept')) {
        setCreateDept(searchParams.get('dept'));
      }
    }
  }, [searchParams]);

  // Filters
  const [activeDeptTab, setActiveDeptTab] = useState('ALL'); // ALL, HR, DevOps, IT, General
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, Open, In Progress, Resolved
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real tickets from Odoo employee.ticket
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const rawTickets = await callOdooKw('employee.ticket', 'search_read', [[]], {
        fields: ['id', 'topic', 'user_id', 'issue', 'state', 'create_date', 'solve_date'],
        order: 'create_date desc',
      });

      if (Array.isArray(rawTickets)) {
        const formatted = rawTickets.map((t) => {
          const rawIssue = t.issue || '';
          let subject = 'Support Ticket';
          let dept = 'General';
          let category = 'General Inquiry';
          let priority = 'Medium';

          // Extract subject from <h3> if available
          const h3Match = rawIssue.match(/<h3>(.*?)<\/h3>/i);
          if (h3Match && h3Match[1]) {
            subject = h3Match[1].replace(/<[^>]*>/g, '').trim();
          } else {
            subject = rawIssue.replace(/<[^>]*>/g, '').trim().slice(0, 60) || 'Support Ticket';
          }

          // Extract category & priority from metadata if available
          const catMatch = rawIssue.match(/Category:<\/strong>\s*([^|<]+)/i);
          if (catMatch && catMatch[1]) category = catMatch[1].trim();

          const priMatch = rawIssue.match(/Priority:<\/strong>\s*([^|<]+)/i);
          if (priMatch && priMatch[1]) priority = priMatch[1].trim();

          const deptMatch = rawIssue.match(/Department:<\/strong>\s*([^|<]+)/i);
          if (deptMatch && deptMatch[1]) {
            dept = deptMatch[1].trim();
          } else {
            if (t.topic === 'it_related') dept = 'IT';
            else if (t.topic === 'hr_related') dept = 'HR';
            else if (t.topic === 'access_issue') dept = 'DevOps';
            else dept = 'General';
          }

          const status = (t.state === 'done' || t.state === 'solve')
            ? 'Resolved'
            : 'Open';

          const uName = Array.isArray(t.user_id) ? t.user_id[1] : (user?.name || 'Employee');
          const dt = t.create_date ? new Date(t.create_date.replace(' ', 'T') + 'Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today';

          return {
            id: `TICK-${String(t.id).padStart(4, '0')}`,
            rawId: t.id,
            department: dept,
            category: category || t.topic || 'General Inquiry',
            priority,
            subject,
            description: t.issue || '<p>No description provided</p>',
            requester: uName,
            email: user?.email || '',
            date: dt,
            status,
            attachments: [],
            activity: [
              {
                author: uName,
                date: dt,
                message: 'Ticket recorded in Odoo 14 helpdesk queue.',
              },
            ],
          };
        });
        setTickets(formatted);
      }
    } catch (err) {
      console.warn('Odoo employee.ticket fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Handle switching to Raise Ticket Page Component
  const handleOpenCreate = (dept = 'DevOps') => {
    setCreateDept(dept);
    setViewMode('create');
    setSearchParams({ tab: 'new', dept });
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSearchParams({});
  };

  const handleCreateTicket = async (ticketData) => {
    try {
      // Map department/category to Odoo's exact Selection field values
      let odooTopic = 'general';
      const dept = (ticketData.department || '').toLowerCase();
      const cat = (ticketData.category || '').toLowerCase();
      if (dept === 'it' || cat.includes('hardware') || cat.includes('laptop') || cat.includes('monitor')) {
        odooTopic = 'it_related';
      } else if (dept === 'hr' || cat.includes('payroll') || cat.includes('leave') || cat.includes('salary')) {
        odooTopic = 'hr_related';
      } else if (dept === 'devops' || cat.includes('access') || cat.includes('server') || cat.includes('ssh') || cat.includes('vpn')) {
        odooTopic = 'access_issue';
      }

      // Store subject & metadata cleanly in issue HTML
      const fullIssue = `<h3>${ticketData.subject}</h3><p><strong>Department:</strong> ${ticketData.department} | <strong>Category:</strong> ${ticketData.category} | <strong>Priority:</strong> ${ticketData.priority}</p><div>${ticketData.description}</div>`;

      const resId = await callOdooKw('employee.ticket', 'create', [{
        topic: odooTopic,
        issue: fullIssue,
        state: 'submit',
      }]);

      toast.success(`Support Ticket #${resId} recorded in Odoo!`);
      await loadTickets();
    } catch (err) {
      console.error('Failed to create ticket in Odoo:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to submit ticket');
    }
    setViewMode('list');
    setSearchParams({});
  };

  // Handle Status Change
  const handleStatusChange = async (ticketId, nextStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: nextStatus } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, status: nextStatus }));
    }
    const matched = tickets.find((t) => t.id === ticketId);
    if (matched && matched.rawId) {
      try {
        const odooState = nextStatus === 'Resolved' ? 'solve' : 'submit';
        await callOdooKw('employee.ticket', 'write', [[matched.rawId], { state: odooState }]);
      } catch (e) {
        console.warn('Odoo ticket state update warning:', e);
      }
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
          {viewMode === 'create' ? (
            /* Render Full-Page Raise Ticket Form Component */
            <RaiseTicketForm
              initialDepartment={createDept}
              onBack={handleBackToList}
              onSubmitTicket={handleCreateTicket}
              currentUser={userName}
            />
          ) : (
            /* Render All Tickets Table & Department Directory */
            <>
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

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenCreate('DevOps')}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Raise Ticket</span>
                  </button>
                </div>
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
                    onClick={() => handleOpenCreate('HR')}
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
                    onClick={() => handleOpenCreate('DevOps')}
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
                    onClick={() => handleOpenCreate('IT')}
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
                    onClick={() => handleOpenCreate('General')}
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
                              Client: {ticket.requester || 'User'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[160px]">
                              {ticket.email || ''}
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
            </>
          )}
        </main>
      </div>

      {/* Ticket Details Modal */}
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
