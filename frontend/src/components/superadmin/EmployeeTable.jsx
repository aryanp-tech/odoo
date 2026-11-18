// src/components/superadmin/EmployeeTable.jsx
// Super Admin Employee Management Directory Table with search, filtering, and permissions inspection

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Building,
  UserCheck,
  UserX,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  SYSTEM_ROLES,
  DEPARTMENTS,
  toggleEmployeeStatus,
  deleteEmployee,
  DEFAULT_ROLE_PERMISSIONS,
} from '../../services/employeeService';

export default function EmployeeTable({
  employees,
  onEdit,
  onChangePassword,
  onCreateNew,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = emp.name?.toLowerCase().includes(q);
        const matchesEmail = emp.email?.toLowerCase().includes(q);
        const matchesBadge = emp.badge_id?.toLowerCase().includes(q);
        const matchesTitle = emp.job_title?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesBadge && !matchesTitle) return false;
      }

      // 2. Role filter
      if (selectedRole !== 'all' && emp.role !== selectedRole) return false;

      // 3. Department filter
      if (selectedDept !== 'all' && emp.department !== selectedDept) return false;

      // 4. Status filter
      if (selectedStatus !== 'all' && emp.status !== selectedStatus) return false;

      return true;
    });
  }, [employees, searchQuery, selectedRole, selectedDept, selectedStatus]);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently remove employee "${name}"?`)) {
      const res = deleteEmployee(id);
      if (res.success) {
        toast.success(res.message);
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.error || 'Failed to delete employee');
      }
    }
  };

  const getRoleBadge = (roleId) => {
    const roleObj = SYSTEM_ROLES.find((r) => r.id === roleId);
    if (!roleObj) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          Employee
        </span>
      );
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleObj.badgeColor}`}>
        {roleObj.label}
      </span>
    );
  };

  // Helper to render concise permission capabilities badges
  const renderPermissionPills = (emp) => {
    const perms = emp.permissions || DEFAULT_ROLE_PERMISSIONS[emp.role] || DEFAULT_ROLE_PERMISSIONS.employee;
    const badges = [];

    if (perms.admin_access === 'super_admin') {
      badges.push({ label: 'Full Super Admin', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' });
    } else if (perms.admin_access === 'settings') {
      badges.push({ label: 'Settings Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' });
    }

    if (perms.employees === 'admin') {
      badges.push({ label: 'HR Administrator', bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' });
    } else if (perms.employees === 'officer') {
      badges.push({ label: 'HR Officer', bg: 'bg-sky-50 text-sky-700 border-sky-200' });
    }

    if (perms.time_off === 'admin' || perms.time_off === 'all_approver') {
      badges.push({ label: 'Leave Approver', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
    }

    if (perms.it_tickets === 'admin') {
      badges.push({ label: 'IT Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200' });
    } else if (perms.it_tickets === 'officer') {
      badges.push({ label: 'IT Officer', bg: 'bg-teal-50 text-teal-700 border-teal-200' });
    }

    if (perms.equipment === 'manager') {
      badges.push({ label: 'Assets Manager', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' });
    }

    if (perms.projects === 'admin') {
      badges.push({ label: 'Project Admin', bg: 'bg-blue-50 text-blue-700 border-blue-200' });
    }

    if (perms.timesheets === 'approver' || perms.timesheets === 'admin') {
      badges.push({ label: 'Timesheet Sign-off', bg: 'bg-amber-50 text-amber-700 border-amber-200' });
    }

    if (badges.length === 0) {
      badges.push({ label: 'Self-Service Only', bg: 'bg-slate-100 text-slate-600 border-slate-200' });
    }

    return (
      <div className="flex flex-wrap gap-1 max-w-[260px]">
        {badges.slice(0, 3).map((b, idx) => (
          <span
            key={idx}
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${b.bg}`}
          >
            {b.label}
          </span>
        ))}
        {badges.length > 3 && (
          <span className="text-[9px] font-bold text-slate-400 px-1 py-0.2">
            +{badges.length - 3} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Header Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, badge ID, title..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter Controls & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="all">All Roles</option>
            {SYSTEM_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-600 transition-all cursor-pointer max-w-[160px] truncate"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Create Button */}
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Employee Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role Hierarchy</th>
              <th className="py-3 px-4">Access Privileges</th>
              <th className="py-3 px-4">Department &amp; Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle size={28} className="text-slate-300" />
                    <span className="font-semibold text-slate-600">No employees match your search or filter</span>
                    <span className="text-[11px] text-slate-400">Try adjusting the filters or create a new employee</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Name + Email + Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        {emp.photo ? (
                          <img src={emp.photo} alt={emp.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{emp.avatar_initials || 'EP'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{emp.name}</span>
                          {emp.role === 'super_admin' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" title="Super Admin"></span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{emp.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getRoleBadge(emp.role)}
                  </td>

                  {/* Permissions Badges */}
                  <td className="py-3 px-4">
                    {renderPermissionPills(emp)}
                  </td>

                  {/* Department & Job Title */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800 truncate">{emp.department}</div>
                    <div className="text-[11px] text-slate-400 truncate">{emp.job_title}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : emp.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      ></span>
                      <span>{emp.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* Edit Employee & Permissions */}
                      <button
                        type="button"
                        onClick={() => onEdit(emp)}
                        title="Edit Profile & Permissions Matrix"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
                      </button>

                      {/* Change Password */}
                      <button
                        type="button"
                        onClick={() => onChangePassword(emp)}
                        title="Change Login Password"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <KeyRound size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(emp.id, emp.name)}
                        title="Delete Employee"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
