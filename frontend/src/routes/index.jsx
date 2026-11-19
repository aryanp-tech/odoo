// src/routes/index.jsx
// Production route tree with code splitting (React.lazy & Suspense) and Route Protection

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Public Authentication Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Super Admin Pages
const SuperAdminDashboardPage = lazy(() => import('../pages/superadmin/SuperAdminDashboardPage'));
const EmployeeManagementPage = lazy(() => import('../pages/superadmin/EmployeeManagementPage'));

// Code-split pages for high performance and reduced initial bundle footprint
const EmployeeDashboardPage = lazy(() => import('../pages/employee/EmployeeDashboardPage'));
const EmployeesDirectoryPage = lazy(() => import('../pages/employee/EmployeesDirectoryPage'));
const ProfilePage = lazy(() => import('../pages/employee/ProfilePage'));
const AttendancePage = lazy(() => import('../pages/employee/AttendancePage'));
const ProjectsPage = lazy(() => import('../pages/employee/ProjectsPage'));
const TimesheetsPage = lazy(() => import('../pages/employee/TimesheetsPage'));
const LeavesPage = lazy(() => import('../pages/employee/LeavesPage'));
const PerformancePage = lazy(() => import('../pages/employee/PerformancePage'));
const AssetsPage = lazy(() => import('../pages/employee/AssetsPage'));
const TicketsPage = lazy(() => import('../pages/employee/TicketsPage'));
const VotingPage = lazy(() => import('../pages/employee/VotingPage'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-slate-500">Loading Module...</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<Navigate to="/reset-password" replace />} />

        {/* Protected Operational Modules */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <EmployeeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <ProtectedRoute>
              <EmployeeDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeesDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/directory" element={<Navigate to="/employees" replace />} />
        <Route path="/departments" element={<Navigate to="/employees" replace />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timesheets"
          element={
            <ProtectedRoute>
              <TimesheetsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/project-timesheets" element={<Navigate to="/timesheets" replace />} />
        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <LeavesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <PerformancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute>
              <AssetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/helpdesk" element={<Navigate to="/tickets" replace />} />
        <Route path="/infrastructure" element={<Navigate to="/tickets" replace />} />
        <Route
          path="/polls"
          element={
            <ProtectedRoute>
              <VotingPage />
            </ProtectedRoute>
          }
        />
        <Route path="/voting" element={<Navigate to="/polls" replace />} />
        <Route path="/announcements" element={<Navigate to="/polls" replace />} />
        <Route path="/office-polls" element={<Navigate to="/polls" replace />} />
        <Route path="/settings" element={<Navigate to="/profile" replace />} />

        {/* Super Admin Management Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'hr_admin']}>
              <EmployeeManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Wildcard redirects back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
