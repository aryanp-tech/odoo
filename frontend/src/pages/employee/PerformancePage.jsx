// src/pages/employee/PerformancePage.jsx
// Clean empty state for Performance Management System (PMS)

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import { Award, Clock } from 'lucide-react';

export default function PerformancePage() {
  const user = getStoredSession();

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="performance" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Top Page Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    Performance Management System (PMS)
                  </h1>
                  <p className="text-xs text-slate-500">
                    Company appraisal cycles &amp; quarterly reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Clean Empty State */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mb-3.5">
                <Award size={26} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                No Active Appraisal Review
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                There are currently no performance evaluations or appraisal forms assigned to your profile. Future review cycles will appear here when initiated.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
