// src/pages/superadmin/EmployeeManagementPage.jsx
// Dedicated Employee Directory & Access Control Workspace for Super Admin

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import {
  getAllEmployees,
  fetchEmployeesFromBackend,
  getSuperAdminMetrics,
} from '../../services/employeeService';
import CreateEmployeeModal from '../../components/superadmin/CreateEmployeeModal';
import EditEmployeeModal from '../../components/superadmin/EditEmployeeModal';
import ChangePasswordModal from '../../components/superadmin/ChangePasswordModal';
import EmployeeTable from '../../components/superadmin/EmployeeTable';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';

export default function EmployeeManagementPage() {
  const navigate = useNavigate();
  const sessionUser = getStoredSession();

  const [employees, setEmployees] = useState(() => getAllEmployees());
  const [metrics, setMetrics] = useState(() => getSuperAdminMetrics());

  const loadBackendEmployees = async () => {
    const liveEmps = await fetchEmployeesFromBackend();
    if (liveEmps) {
      setEmployees(liveEmps);
      setMetrics(getSuperAdminMetrics());
    }
  };

  useEffect(() => {
    loadBackendEmployees();
  }, []);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [passwordEmployee, setPasswordEmployee] = useState(null);

  const refreshData = async () => {
    await loadBackendEmployees();
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800 font-sans antialiased">
      {/* 1. Sidebar */}
      <Sidebar activeTab="admin-employees" />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <TopNavbar />

        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Breadcrumb & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                <button
                  type="button"
                  onClick={() => navigate(sessionUser?.role === 'hr_admin' ? '/' : '/admin')}
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>{sessionUser?.role === 'hr_admin' ? 'Home' : 'Super Admin'}</span>
                </button>
                <span>/</span>
                <span className="font-bold text-slate-800">Employee Directory &amp; Access</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Manage Employees &amp; Credentials
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create new employee accounts with roles, change employee details, and reset login passwords
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer self-start sm:self-auto"
            >
              <UserPlus size={15} />
              <span>Create Employee</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Staff</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">{metrics.totalEmployees}</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Users</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">{metrics.activeEmployees}</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Lead &amp; Admin</span>
              <span className="text-xl font-black text-purple-600 mt-1 block">{metrics.adminAccounts}</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Departments</span>
              <span className="text-xl font-black text-indigo-600 mt-1 block">{metrics.totalDepartments}</span>
            </div>
          </div>

          {/* Employee Directory Table */}
          <EmployeeTable
            employees={employees}
            onEdit={(emp) => setEditingEmployee(emp)}
            onChangePassword={(emp) => setPasswordEmployee(emp)}
            onCreateNew={() => setIsCreateOpen(true)}
            onRefresh={refreshData}
          />
        </main>
      </div>

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onEmployeeCreated={refreshData}
      />

      <EditEmployeeModal
        isOpen={Boolean(editingEmployee)}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
        onEmployeeUpdated={refreshData}
      />

      <ChangePasswordModal
        isOpen={Boolean(passwordEmployee)}
        employee={passwordEmployee}
        onClose={() => setPasswordEmployee(null)}
        onPasswordChanged={refreshData}
      />
    </div>
  );
}
