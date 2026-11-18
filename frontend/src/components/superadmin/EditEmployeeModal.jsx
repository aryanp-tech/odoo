// src/components/superadmin/EditEmployeeModal.jsx
// Modal for Super Admin to modify all employee details, including role hierarchy and granular module permissions

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Shield,
  Phone,
  Sparkles,
  KeyRound,
  UserCheck,
  Sliders,
  CheckCircle2,
  Users,
  CalendarCheck,
  Clock,
  Award,
  FolderKanban,
  FileSpreadsheet,
  LifeBuoy,
  Laptop,
  Vote,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  updateEmployee,
  SYSTEM_ROLES,
  DEPARTMENTS,
  PERMISSION_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
} from '../../services/employeeService';
import { getStoredSession } from '../../services/authService';

const MODULE_ICONS = {
  Users,
  CalendarCheck,
  Clock,
  Award,
  FolderKanban,
  FileSpreadsheet,
  LifeBuoy,
  Laptop,
  Vote,
  ShieldAlert,
};

export default function EditEmployeeModal({ isOpen, employee, onClose, onEmployeeUpdated }) {
  const currentSession = getStoredSession();
  const isSuperAdmin = currentSession?.role === 'super_admin';

  const [activeTab, setActiveTab] = useState('credentials'); // 'credentials' | 'permissions'

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [jobTitle, setJobTitle] = useState('');
  const [workMobile, setWorkMobile] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [workingType, setWorkingType] = useState('Hybrid (Full-Time)');
  const [manager, setManager] = useState('');
  const [status, setStatus] = useState('Active');
  const [badgeId, setBadgeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Granular permissions
  const [permissions, setPermissions] = useState(DEFAULT_ROLE_PERMISSIONS.employee);

  useEffect(() => {
    if (employee) {
      setName(employee.name || '');
      setEmail(employee.email || '');
      setRole(employee.role || 'employee');
      setDepartment(employee.department || DEPARTMENTS[0]);
      setJobTitle(employee.job_title || '');
      setWorkMobile(employee.workMobile || '');
      setWorkPhone(employee.workPhone || '');
      setWorkingType(employee.workingType || 'Hybrid (Full-Time)');
      setManager(employee.manager || '');
      setStatus(employee.status || 'Active');
      setBadgeId(employee.badge_id || '');
      setNewPassword('');

      // Populate permissions from employee record or fallback to role defaults
      if (employee.permissions) {
        setPermissions({ ...employee.permissions });
      } else if (DEFAULT_ROLE_PERMISSIONS[employee.role]) {
        setPermissions({ ...DEFAULT_ROLE_PERMISSIONS[employee.role] });
      } else {
        setPermissions({ ...DEFAULT_ROLE_PERMISSIONS.employee });
      }
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const availableRoles = SYSTEM_ROLES.filter((r) => {
    if (isSuperAdmin) return true;
    if (r.id === 'super_admin' || r.id === 'it_admin' || r.id === 'it_officer') return false;
    return true;
  });

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setShowPassword(true);
    toast.success('Generated new secure password');
  };

  const handleRoleChange = (newRoleId) => {
    setRole(newRoleId);
    if (DEFAULT_ROLE_PERMISSIONS[newRoleId]) {
      setPermissions({ ...DEFAULT_ROLE_PERMISSIONS[newRoleId] });
    }
  };

  const handlePermissionChange = (moduleId, optionId) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: optionId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter employee name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter employee email');
      return;
    }
    if (newPassword.trim() && newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedRoleObj = SYSTEM_ROLES.find((r) => r.id === role);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role,
        roleLabel: selectedRoleObj?.label || 'Employee',
        department,
        job_title: jobTitle.trim() || selectedRoleObj?.label,
        workMobile: workMobile.trim(),
        workPhone: workPhone.trim(),
        workingType,
        manager,
        status,
        badge_id: badgeId.trim(),
        permissions,
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await updateEmployee(employee.id, payload);

      if (res.success) {
        toast.success(`Employee "${res.employee.name}" updated successfully!`);
        if (onEmployeeUpdated) onEmployeeUpdated(res.employee);
        onClose();
      } else {
        toast.error(res.error || 'Failed to update employee');
      }
    } catch (err) {
      toast.error('An unexpected error occurred while updating employee.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#15203d] to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-md flex items-center justify-center text-blue-300 border border-blue-400/30 shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Edit Employee Profile &amp; Access Rights
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                  {employee.roleLabel || employee.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Modify role tier, credentials, contact details, and modular backend security groups
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-200/70 bg-slate-50/50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'credentials'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Briefcase size={14} />
            <span>1. Profile &amp; Role Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'permissions'
                ? 'bg-white text-indigo-600 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Sliders size={14} />
            <span>2. Backend Access Rights Matrix</span>
            <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-700 font-extrabold">
              Editable
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'credentials' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Corporate Email / Login <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Update Password & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      New Password (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} />
                      <span>Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep existing password"
                      className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Work Mobile
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={workMobile}
                      onChange={(e) => setWorkMobile(e.target.value)}
                      placeholder="+91 98765 01234"
                      className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Role Hierarchy Preset Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Role Hierarchy Preset
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Switching will update default permissions
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {availableRoles.map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {r.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium line-clamp-1">
                          {r.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: Department, Job Title, Manager, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Sliders size={14} className="text-indigo-600" />
                    <span>Granular Backend Security Permissions Matrix</span>
                  </div>
                  <p className="text-[11px] text-indigo-700/80 mt-0.5">
                    Super Admin can customize each specific module access level independently. Nothing is fixed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPermissions({ ...(DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.employee) })}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer shrink-0"
                >
                  Reset to Role Defaults
                </button>
              </div>

              {/* Module Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PERMISSION_MODULES.map((mod) => {
                  const Icon = MODULE_ICONS[mod.iconName] || Users;
                  const currentVal = permissions[mod.id] || 'none';
                  const isLockedForHr = !isSuperAdmin && mod.id === 'admin_access';

                  return (
                    <div
                      key={mod.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                              <Icon size={15} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 leading-tight">
                                {mod.name}
                              </div>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {mod.category}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {mod.options.find((o) => o.id === currentVal)?.label || 'None'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mb-3">
                          {mod.description}
                        </p>
                      </div>

                      {/* Dropdown Options */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Access Level
                        </label>
                        <select
                          disabled={isLockedForHr}
                          value={currentVal}
                          onChange={(e) => handlePermissionChange(mod.id, e.target.value)}
                          className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer disabled:opacity-50"
                        >
                          {mod.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {activeTab === 'credentials' ? (
                <span>Next: customize granular backend access rights matrix</span>
              ) : (
                <span>Changes will be synced directly to Odoo 14 security groups</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'credentials' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('permissions')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                  Edit Permissions Matrix &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  &larr; Back to Details
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save All Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
