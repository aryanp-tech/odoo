// src/routes/index.jsx
// Production route tree with code splitting (React.lazy & Suspense) for all operational modules

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Code-split pages for high performance and reduced initial bundle footprint
const EmployeeDashboardPage = lazy(() => import('../pages/employee/EmployeeDashboardPage'));
const ProfilePage = lazy(() => import('../pages/employee/ProfilePage'));
const AttendancePage = lazy(() => import('../pages/employee/AttendancePage'));
const ProjectTimesheetPage = lazy(() => import('../pages/employee/ProjectTimesheetPage'));
const LeavesPage = lazy(() => import('../pages/employee/LeavesPage'));
const PerformancePage = lazy(() => import('../pages/employee/PerformancePage'));
const AssetsPage = lazy(() => import('../pages/employee/AssetsPage'));
const InfrastructurePage = lazy(() => import('../pages/employee/InfrastructurePage'));
const VotingPage = lazy(() => import('../pages/employee/VotingPage'));
const SettingsPage = lazy(() => import('../pages/employee/SettingsPage'));

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
        {/* Main Dashboard / Overview */}
        <Route path="/" element={<EmployeeDashboardPage />} />
        <Route path="/overview" element={<EmployeeDashboardPage />} />

        {/* Operational Modules */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/project-timesheets" element={<ProjectTimesheetPage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/infrastructure" element={<InfrastructurePage />} />
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Wildcard redirects back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
