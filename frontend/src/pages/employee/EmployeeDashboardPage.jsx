// src/pages/employee/EmployeeDashboardPage.jsx
// Complete Employee Self-Service (ESS) Dashboard including all operational cards

import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import WelcomeBanner from '../../components/employee/WelcomeBanner';
import KpiMetricCards from '../../components/employee/KpiMetricCards';
import WeeklyTelemetryCard from '../../components/employee/WeeklyTelemetryCard';
import QuickActionsCard from '../../components/employee/QuickActionsCard';
import UpcomingBirthdaysCard from '../../components/employee/UpcomingBirthdaysCard';
import CompanyPollsCard from '../../components/employee/CompanyPollsCard';
import ApplyLeaveModal from '../../components/employee/ApplyLeaveModal';
import { useGetEmployeeDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';

export default function EmployeeDashboardPage() {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const fallbackUser = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery(undefined, {
    pollingInterval: 30000,
  });

  const user = dashboardData?.user || fallbackUser;
  const attendance = dashboardData?.attendance || {};
  const leaveQuotas = dashboardData?.leaveQuotas || {};
  const poll = dashboardData?.poll || {};
  const birthdays = dashboardData?.birthdays || [];

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeTab="overview" />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar user={user} />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-5">
            {/* Row 1: Greeting Dossier & Daily Attendance */}
            <WelcomeBanner user={user} attendance={attendance} />

            {/* Row 2: 4 Key Metric Cards (Attendance, Total Leaves, Project Timesheets, Pulse Polls) */}
            <KpiMetricCards
              attendance={attendance}
              leaveQuotas={leaveQuotas}
              onRequestLeave={() => setIsLeaveModalOpen(true)}
            />

            {/* Row 3: Two-Column Lower Grid with all 4 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column (7 cols): Weekly Telemetry & Upcoming Birthdays */}
              <div className="lg:col-span-7 space-y-5">
                <WeeklyTelemetryCard attendance={attendance} />
                <UpcomingBirthdaysCard birthdays={birthdays} />
              </div>

              {/* Right Column (5 cols): Quick Actions & Portals & Office Pulse Poll */}
              <div className="lg:col-span-5 space-y-5">
                <QuickActionsCard onRequestLeave={() => setIsLeaveModalOpen(true)} />
                <CompanyPollsCard poll={poll} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </div>
  );
}
