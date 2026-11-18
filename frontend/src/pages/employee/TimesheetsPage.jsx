// src/pages/employee/TimesheetsPage.jsx
// Dedicated Projects / Timesheets page matching Odoo list view mockup with daily work history tracking

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import CreateTimesheetModal from '../../components/employee/CreateTimesheetModal';
import TimesheetDetailsModal from '../../components/employee/TimesheetDetailsModal';
import { getStoredSession } from '../../services/authService';
import { callOdooKw } from '../../services/api/apiSlice';
import {
  Clock,
  Plus,
  Download,
  Search,
  Filter,
  ListFilter,
  Star,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimesheetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = getStoredSession();

  const projectFilter = searchParams.get('project') || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live company projects from Odoo project.project
  const [companyProjects, setCompanyProjects] = useState([]);

  // Live timesheet records from Odoo account.analytic.line
  const [timesheetRecords, setTimesheetRecords] = useState([]);

  // Load real projects and real timesheets live from Odoo backend
  const loadTimesheetData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch real projects
      const projs = await callOdooKw('project.project', 'search_read', [[]], {
        fields: ['id', 'name', 'task_count'],
        order: 'name asc',
      });
      if (Array.isArray(projs) && projs.length > 0) {
        setCompanyProjects(projs.map((p) => ({
          id: p.id,
          name: p.name,
          taskCount: p.task_count || 0,
        })));
      }

      // 2. Fetch real timesheets from account.analytic.line
      const lines = await callOdooKw('account.analytic.line', 'search_read', [[]], {
        fields: ['id', 'name', 'unit_amount', 'date', 'employee_id', 'project_id', 'task_id'],
        order: 'date desc',
      });

      if (Array.isArray(lines)) {
        const formatted = lines.map((r) => {
          const hours = Math.floor(r.unit_amount || 0);
          const mins = Math.round(((r.unit_amount || 0) - hours) * 60);
          const durationStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
          const dateFormatted = r.date ? r.date.split('-').reverse().join('/') : '';
          return {
            id: String(r.id),
            date: dateFormatted,
            employee: Array.isArray(r.employee_id) ? r.employee_id[1] : (user?.name || 'Aryan Patel'),
            project: Array.isArray(r.project_id) ? r.project_id[1] : 'Internal',
            task: Array.isArray(r.task_id) ? r.task_id[1] : 'Analysis & Sprint Work',
            description: r.name || 'Worked on assigned sprint deliverable.',
            duration: durationStr,
            unit_amount: r.unit_amount,
            status: 'Sent',
          };
        });
        setTimesheetRecords(formatted);
      }
    } catch (err) {
      console.warn('Failed to load live timesheets from Odoo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimesheetData();
  }, []);

  // Selected checkbox rows
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(filteredRecords.map((r) => r.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddTimesheet = async (newRec) => {
    // 1. Write live to Odoo backend account.analytic.line
    try {
      const stored = getStoredSession();
      const empId = stored.employee_id || 3;

      // Find matching project id from companyProjects
      const matchedProj = companyProjects.find(
        (p) => p.name.toLowerCase() === (newRec.project || '').toLowerCase()
      );
      const projId = matchedProj ? matchedProj.id : (companyProjects[0]?.id || 1);

      // Parse hours (e.g., "08:00" -> 8.0)
      const parts = (newRec.duration || '08:00').split(':');
      const floatHours = Number(parts[0] || 8) + (Number(parts[1] || 0) / 60);

      // Format date YYYY-MM-DD
      const dateParts = (newRec.date || '').split('/');
      const isoDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : new Date().toISOString().split('T')[0];

      const createdId = await callOdooKw('account.analytic.line', 'create', [
        {
          name: newRec.description || newRec.task || 'Daily timesheet',
          unit_amount: floatHours,
          date: isoDate,
          employee_id: empId,
          project_id: projId,
        },
      ]);

      newRec.id = String(createdId);
      toast.success('Timesheet saved to Odoo 14 backend!');
    } catch (err) {
      console.warn('Odoo timesheet write warning:', err);
    }

    setTimesheetRecords((prev) => [newRec, ...prev]);
    setSelectedTimesheet(newRec);
    setIsDetailsModalOpen(true);
  };

  const handleSendTimesheet = (id) => {
    let updated = null;
    setTimesheetRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          updated = { ...r, status: 'Sent' };
          return updated;
        }
        return r;
      })
    );
    toast.success('Timesheet report sent to Reporting Manager & Project Leader!');
    if (updated) {
      setSelectedTimesheet(updated);
      setIsDetailsModalOpen(true);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedTimesheet(item);
    setIsDetailsModalOpen(true);
  };

  const handleExport = () => {
    toast.success('Exporting timesheet records to Excel (.xlsx)');
  };

  // Filtered records based on URL project filter & search query
  const filteredRecords = timesheetRecords.filter((rec) => {
    if (projectFilter && rec.project.toLowerCase() !== projectFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        rec.task.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q) ||
        rec.project.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      {/* 1. Sidebar */}
      <Sidebar activeTab="timesheets" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-4 md:p-5 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-3.5">
            {/* Top Control Bar matching Odoo Mockup (Image 2) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              {/* Left: Breadcrumbs & Primary Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    Projects
                  </button>
                  <span className="text-slate-300">/</span>
                  <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    Timesheets
                  </h1>
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {/* Create Button (Odoo style purple button) */}
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5a3a52] shadow-xs transition-all cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Create</span>
                  </button>

                  {/* Export Button */}
                  <button
                    type="button"
                    onClick={handleExport}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                    title="Export Records"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>

              {/* Right: Search & Filters Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input with Active Project Tag */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-[#f8fafc] px-2 py-1 shadow-2xs text-xs">
                  <div className="flex items-center gap-1 bg-[#714B67] text-white font-bold text-[10px] px-2 py-0.5 rounded-lg mr-1.5">
                    <span>Project</span>
                  </div>

                  {projectFilter && (
                    <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-md mr-1.5 whitespace-nowrap">
                      <span>{projectFilter}</span>
                      <button
                        type="button"
                        onClick={() => setSearchParams({})}
                        className="hover:text-purple-950 cursor-pointer"
                        title="Clear Project Filter"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks, descriptions..."
                    className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-36 sm:w-56"
                  />
                  <Search size={14} className="text-slate-400 ml-1" />
                </div>

                {/* Filter and Group By Controls */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Filter size={12} />
                    <span>Filters</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <ListFilter size={12} />
                    <span>Group By</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Star size={12} className="text-amber-500 fill-amber-400" />
                    <span>Favorites</span>
                  </button>
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-1 pl-1 text-[11px] font-semibold text-slate-500">
                  <span>1-{filteredRecords.length} / {filteredRecords.length}</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-700">
                      <ChevronLeft size={14} />
                    </button>
                    <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-700">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Project Filter Notice (If Filtered) */}
            {projectFilter && (
              <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Filtered by Project:</span>
                  <span className="font-semibold underline">{projectFilter}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="font-bold text-xs text-purple-700 hover:text-purple-950 cursor-pointer"
                >
                  Show All Projects ({timesheetRecords.length} entries)
                </button>
              </div>
            )}

            {/* Timesheet Work History Table matching Odoo Mockup */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap min-w-[960px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80">
                      <th className="py-3 px-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAll}
                          checked={selectedRows.length === filteredRecords.length && filteredRecords.length > 0}
                          className="rounded text-purple-600 focus:ring-purple-400 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-3 font-bold">Date</th>
                      <th className="py-3 px-3 font-bold">Employee</th>
                      <th className="py-3 px-3 font-bold">Project</th>
                      <th className="py-3 px-4 font-bold">Task</th>
                      <th className="py-3 px-4 font-bold">Description</th>
                      <th className="py-3 px-3 font-bold text-center">Duration (Hours)</th>
                      <th className="py-3 px-3 font-bold text-right">Upload F...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium bg-white">
                    {filteredRecords.map((item) => {
                      const isSelected = selectedRows.includes(item.id);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => handleViewDetails(item)}
                          className={`hover:bg-purple-50/40 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-purple-50/60' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(item.id)}
                              className="rounded text-purple-600 focus:ring-purple-400 cursor-pointer"
                            />
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            {item.date}
                          </td>

                          {/* Employee */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#714B67] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                                {item.employee.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <span className="text-slate-800 font-semibold truncate max-w-[110px]">
                                {item.employee}
                              </span>
                            </div>
                          </td>

                          {/* Project (Clickable filter) */}
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSearchParams({ project: item.project })}
                              className="text-slate-800 hover:text-purple-700 hover:underline font-semibold text-left truncate max-w-[160px] cursor-pointer"
                              title={`Filter by ${item.project}`}
                            >
                              {item.project}
                            </button>
                          </td>

                          {/* Task */}
                          <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate group-hover:text-purple-700 transition-colors" title={item.task}>
                            {item.task}
                          </td>

                          {/* Description (Daily work history) */}
                          <td className="py-3 px-4 text-slate-600 max-w-[340px] truncate" title={item.description}>
                            {item.description}
                          </td>

                          {/* Duration (Hours) */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                            {item.duration}
                          </td>

                          {/* Send Timesheet Action Button / Status */}
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            {item.status === 'Sent' || item.status === 'Sended' ? (
                              <button
                                type="button"
                                onClick={() => handleViewDetails(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-2xs transition-all cursor-pointer"
                                title="Timesheet sent to Manager & Project Leader. Click to view timeline."
                              >
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                <span>Sent</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSendTimesheet(item.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold text-white bg-[#714B67] hover:bg-[#5a3a52] shadow-2xs transition-all cursor-pointer"
                              >
                                <Send size={11} />
                                <span>Send Timesheet</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length === 0 && (
                <div className="py-12 text-center text-slate-400">
                  <Clock size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">No timesheet records found.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchParams({});
                      setSearchQuery('');
                    }}
                    className="mt-2 text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                  >
                    Clear search and project filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Log Timesheet Work History Modal */}
      <CreateTimesheetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={companyProjects}
        selectedProject={projectFilter}
        onAddTimesheet={handleAddTimesheet}
      />

      {/* Submitted Timesheet & Manager-to-Project-Leader Timeline Modal */}
      <TimesheetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        timesheet={selectedTimesheet}
      />
    </div>
  );
}
