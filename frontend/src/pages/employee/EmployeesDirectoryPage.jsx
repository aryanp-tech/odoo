// src/pages/employee/EmployeesDirectoryPage.jsx
// Latitude TechnoLabs Employee Directory by Department
// Live synchronization with Odoo 14 hr.department and hr.employee

import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { callOdooKw } from '../../services/api/apiSlice';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Shield,
  Cloud,
  Smartphone,
  Code2,
  Layers,
  TrendingUp,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Grid,
  List,
  ChevronRight,
  X,
  Filter,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Department visual styling and iconography configuration
const DEPARTMENT_CONFIG = {
  'Human Resources (HR)': {
    icon: Shield,
    color: 'from-pink-500 to-rose-600',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    lightBg: 'bg-rose-50/50',
    hoverBorder: 'hover:border-rose-300',
    description: 'Talent Acquisition, People Operations & Workplace Culture',
  },
  'DevOps & Cloud': {
    icon: Cloud,
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    lightBg: 'bg-teal-50/50',
    hoverBorder: 'hover:border-teal-300',
    description: 'Cloud Infrastructure, Kubernetes, CI/CD & Reliability Engineering',
  },
  'App Development': {
    icon: Smartphone,
    color: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    lightBg: 'bg-purple-50/50',
    hoverBorder: 'hover:border-purple-300',
    description: 'Native iOS/Android, Flutter, Cross-Platform & Mobile Architecture',
  },
  'React.js Development': {
    icon: Code2,
    color: 'from-sky-500 to-blue-600',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    lightBg: 'bg-sky-50/50',
    hoverBorder: 'hover:border-sky-300',
    description: 'React.js, Next.js, Redux State Systems & Modern Web Frontends',
  },
  'Engineering & Cloud Systems': {
    icon: Layers,
    color: 'from-indigo-600 to-violet-700',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    lightBg: 'bg-indigo-50/50',
    hoverBorder: 'hover:border-indigo-300',
    description: 'Core Engineering Systems, Backend Architecture & Technical Projects',
  },
  'Sales & Marketing': {
    icon: TrendingUp,
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    lightBg: 'bg-amber-50/50',
    hoverBorder: 'hover:border-amber-300',
    description: 'Enterprise Growth, Client Partnerships & Business Strategy',
  },
};

export default function EmployeesDirectoryPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active filters
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal inspection state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(null);

  // 1. Fetch live departments and employees from Odoo 14
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch departments
      const deptsRes = await callOdooKw(
        'hr.department',
        'search_read',
        [[]],
        {
          fields: ['id', 'name', 'total_employee', 'manager_id'],
          order: 'name asc',
        }
      );

      // Fetch active employees
      const empsRes = await callOdooKw(
        'hr.employee',
        'search_read',
        [[]],
        {
          fields: [
            'id',
            'name',
            'work_email',
            'job_title',
            'department_id',
            'work_phone',
            'mobile_phone',
            'work_location',
            'parent_id',
          ],
          order: 'name asc',
        }
      );

      if (Array.isArray(deptsRes)) {
        setDepartments(deptsRes);
      }
      if (Array.isArray(empsRes)) {
        setEmployees(empsRes);
      }
    } catch (err) {
      console.error('Error fetching directory data from Odoo:', err);
      toast.error('Failed to sync live directory from Odoo backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter employees based on selected department and search query
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Department filter
      if (selectedDeptId !== 'all') {
        const empDeptId = emp.department_id ? emp.department_id[0] : null;
        if (empDeptId !== Number(selectedDeptId)) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (emp.name || '').toLowerCase();
        const title = (emp.job_title || '').toLowerCase();
        const email = (emp.work_email || '').toLowerCase();
        const phone = (emp.work_phone || emp.mobile_phone || '').toLowerCase();
        const dept = emp.department_id ? emp.department_id[1].toLowerCase() : '';

        return (
          name.includes(q) ||
          title.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          dept.includes(q)
        );
      }

      return true;
    });
  }, [employees, selectedDeptId, searchQuery]);

  // Group filtered employees by department name
  const groupedByDepartment = useMemo(() => {
    const groups = {};
    filteredEmployees.forEach((emp) => {
      const deptName = emp.department_id ? emp.department_id[1] : 'General Workforce';
      if (!groups[deptName]) {
        groups[deptName] = [];
      }
      groups[deptName].push(emp);
    });
    return groups;
  }, [filteredEmployees]);

  const handleCopyEmail = (email, e) => {
    e?.stopPropagation();
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'LT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getDepartmentConfig = (deptName) => {
    return (
      DEPARTMENT_CONFIG[deptName] || {
        icon: Building2,
        color: 'from-slate-600 to-slate-800',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        lightBg: 'bg-slate-50',
        hoverBorder: 'hover:border-slate-300',
        description: 'Latitude TechnoLabs Core Team',
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800 font-sans antialiased">
      {/* 1. Primary Left Sidebar */}
      <Sidebar activeTab="employees" />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <TopNavbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 border border-white/10 text-xs font-semibold backdrop-blur-xs mb-3">
                  <Building2 size={13} />
                  <span>Latitude TechnoLabs Workforce Directory</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Employee Directory by Department
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Browse company squads, departments, technical leaders, and contact colleagues directly across Latitude TechnoLabs.
                </p>
              </div>

              {/* Total Stats Counters */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                  <div className="text-2xl font-black text-white">{employees.length}</div>
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Total Staff
                  </div>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                  <div className="text-2xl font-black text-indigo-300">{departments.length}</div>
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Departments
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Selection Strip (Option of Different Departments) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter size={13} />
                <span>Select Department</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {selectedDeptId === 'all'
                  ? `Showing all ${filteredEmployees.length} employees`
                  : `Filtered: ${filteredEmployees.length} in selected squad`}
              </span>
            </div>

            {/* Department Quick Filter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
              {/* Option: All Departments */}
              <button
                type="button"
                onClick={() => setSelectedDeptId('all')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDeptId === 'all'
                    ? 'bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-indigo-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      selectedDeptId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Users size={14} />
                  </div>
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      selectedDeptId === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {employees.length}
                  </span>
                </div>
                <div className="text-xs font-bold truncate">All Departments</div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    selectedDeptId === 'all' ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  Full company
                </div>
              </button>

              {/* Department specific options */}
              {departments.map((dept) => {
                const isSelected = selectedDeptId === String(dept.id);
                const config = getDepartmentConfig(dept.name);
                const Icon = config.icon;
                const count = dept.total_employee || 0;

                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDeptId(String(dept.id))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:border-indigo-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate" title={dept.name}>
                      {dept.name}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {count === 1 ? '1 member' : `${count} members`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar & View Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee by name, job title, email, or department..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid size={13} />
                <span>Grid Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List size={13} />
                <span>List View</span>
              </button>
            </div>
          </div>

          {/* Employee Directory Content */}
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-200">
              <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-slate-500">
                Syncing employees and squads from Odoo...
              </span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No employees found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching employee was found for this filter. Try adjusting your search query or selecting a different department.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDeptId('all');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : selectedDeptId === 'all' && !searchQuery ? (
            // GROUPED VIEW BY DEPARTMENT (when "All" is active)
            <div className="space-y-8">
              {Object.entries(groupedByDepartment).map(([deptName, deptMembers]) => {
                const config = getDepartmentConfig(deptName);
                const Icon = config.icon;

                return (
                  <div key={deptName} className="space-y-3">
                    {/* Department Header Badge */}
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center bg-gradient-to-tr ${config.color} text-white shadow-xs`}
                        >
                          <Icon size={14} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {deptName}
                          </h3>
                          <p className="text-[11px] text-slate-500">{config.description}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                        {deptMembers.length} {deptMembers.length === 1 ? 'Member' : 'Members'}
                      </span>
                    </div>

                    {/* Member Cards Grid */}
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {deptMembers.map((emp) => (
                          <EmployeeCard
                            key={emp.id}
                            emp={emp}
                            config={config}
                            getInitials={getInitials}
                            onSelect={() => setSelectedEmployee(emp)}
                            onCopyEmail={handleCopyEmail}
                            copiedEmail={copiedEmail}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmployeeTableView
                        employees={deptMembers}
                        getInitials={getInitials}
                        onSelect={(emp) => setSelectedEmployee(emp)}
                        onCopyEmail={handleCopyEmail}
                        copiedEmail={copiedEmail}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // FILTERED SINGLE SQUAD OR SEARCH RESULTS
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  Showing {filteredEmployees.length} matching employee{filteredEmployees.length > 1 ? 's' : ''}
                </span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((emp) => {
                    const deptName = emp.department_id ? emp.department_id[1] : 'General';
                    const config = getDepartmentConfig(deptName);
                    return (
                      <EmployeeCard
                        key={emp.id}
                        emp={emp}
                        config={config}
                        getInitials={getInitials}
                        onSelect={() => setSelectedEmployee(emp)}
                        onCopyEmail={handleCopyEmail}
                        copiedEmail={copiedEmail}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmployeeTableView
                  employees={filteredEmployees}
                  getInitials={getInitials}
                  onSelect={(emp) => setSelectedEmployee(emp)}
                  onCopyEmail={handleCopyEmail}
                  copiedEmail={copiedEmail}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. Detailed Employee Profile Modal */}
      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          getInitials={getInitials}
          getDepartmentConfig={getDepartmentConfig}
          onCopyEmail={handleCopyEmail}
          copiedEmail={copiedEmail}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Subcomponent: Employee Card (Grid View)
// -------------------------------------------------------------------------
function EmployeeCard({
  emp,
  config,
  getInitials,
  onSelect,
  onCopyEmail,
  copiedEmail,
}) {
  const deptName = emp.department_id ? emp.department_id[1] : 'General';
  const email = emp.work_email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@latitudetechnolabs.org`;
  const phone = emp.work_phone || emp.mobile_phone || '+91 79 4000 0000';
  const location = emp.work_location || 'Latitude TechnoLabs HQ, Makarba';

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Top Header: Avatar + Status */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                {getInitials(emp.name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {emp.name}
              </h4>
              <p className="text-xs font-semibold text-slate-600 line-clamp-1 mt-0.5">
                {emp.job_title || 'Software Engineer'}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
            #{String(emp.id).padStart(3, '0')}
          </span>
        </div>

        {/* Department Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.badgeColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            <span>{deptName}</span>
          </span>
        </div>

        {/* Contact Strip */}
        <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 group/email">
            <div className="flex items-center gap-2 truncate">
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <button
              type="button"
              onClick={(e) => onCopyEmail(email, e)}
              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Copy Email"
            >
              {copiedEmail === email ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">{location}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
        <span>View Profile Dossier</span>
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Subcomponent: Employee Table View
// -------------------------------------------------------------------------
function EmployeeTableView({
  employees,
  getInitials,
  onSelect,
  onCopyEmail,
  copiedEmail,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
            <tr>
              <th className="px-5 py-3">Employee</th>
              <th className="px-4 py-3">Job Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Contact Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const deptName = emp.department_id ? emp.department_id[1] : 'General';
              const email = emp.work_email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@latitudetechnolabs.org`;
              const phone = emp.work_phone || emp.mobile_phone || '+91 79 4000 0000';
              const location = emp.work_location || 'Latitude HQ, Makarba';

              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelect(emp)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(emp.name)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: #{String(emp.id).padStart(3, '0')}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {emp.job_title || 'Software Engineer'}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {deptName}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[180px]">{email}</span>
                      <button
                        type="button"
                        onClick={(e) => onCopyEmail(email, e)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedEmail === email ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600 font-mono">{phone}</td>

                  <td className="px-4 py-3 text-slate-500">{location}</td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(emp);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Subcomponent: Employee Detail Modal
// -------------------------------------------------------------------------
function EmployeeModal({
  employee,
  onClose,
  getInitials,
  getDepartmentConfig,
  onCopyEmail,
  copiedEmail,
}) {
  const deptName = employee.department_id ? employee.department_id[1] : 'General';
  const config = getDepartmentConfig(deptName);
  const Icon = config.icon;
  const email = employee.work_email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@latitudetechnolabs.org`;
  const phone = employee.work_phone || employee.mobile_phone || '+91 79 4000 0000';
  const location = employee.work_location || 'Latitude TechnoLabs HQ, Makarba';
  const managerName = employee.parent_id ? employee.parent_id[1] : 'Divyang Parmar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header Ribbon */}
        <div className={`p-6 bg-gradient-to-r ${config.color} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-xl flex items-center justify-center shadow-lg">
              {getInitials(employee.name)}
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">{employee.name}</h3>
              <p className="text-xs text-white/90 mt-0.5 font-medium">
                {employee.job_title || 'Software Engineer'}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white mt-1.5">
                <Icon size={11} />
                <span>{deptName}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer self-start"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Details */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</span>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                #EMP-{String(employee.id).padStart(3, '0')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
              <div className="inline-flex items-center gap-1.5 font-bold text-emerald-700 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Member</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs">Contact & Location</h4>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-indigo-600 shrink-0" />
                  <span className="font-mono text-slate-800">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => onCopyEmail(email, e)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedEmail === email ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <Phone size={14} className="text-indigo-600 shrink-0" />
                <span className="font-mono text-slate-800">{phone}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <MapPin size={14} className="text-indigo-600 shrink-0" />
                <span className="text-slate-700">{location}</span>
              </div>
            </div>
          </div>

          {/* Org & Schedule */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 text-xs">Work Schedule & Approvers</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Reporting Manager</span>
                <div className="font-bold text-slate-900 mt-0.5">{managerName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Working Schedule</span>
                <div className="font-bold text-slate-900 mt-0.5">Standard 40h/wk (IST)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Mail size={13} />
            <span>Send Email</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
