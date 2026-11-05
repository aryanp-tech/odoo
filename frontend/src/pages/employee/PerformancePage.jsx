// src/pages/employee/PerformancePage.jsx
// Performance Management System & Quarterly Review (synced with Odoo quarterly.review)

import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function PerformancePage() {
  const user = getStoredSession();
  const [selectedQuarter, setSelectedQuarter] = useState('q3-2026');

  const competencies = [
    { label: 'Quality of Work', self: 4.8, manager: 4.7, color: 'bg-indigo-600' },
    { label: 'Technical & Job Knowledge', self: 4.9, manager: 5.0, color: 'bg-teal-600' },
    { label: 'Quantity & Sprint Velocity', self: 4.6, manager: 4.8, color: 'bg-sky-600' },
    { label: 'System Reliability & Uptime', self: 4.9, manager: 4.9, color: 'bg-emerald-600' },
    { label: 'Communication & Team Synergy', self: 4.5, manager: 4.6, color: 'bg-purple-600' },
    { label: 'Adaptability & Problem Solving', self: 4.7, manager: 4.8, color: 'bg-amber-600' },
    { label: 'Attendance & Punctuality', self: 4.9, manager: 5.0, color: 'bg-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="performance" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Header with Title & Quarter Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Performance Management &amp; Quarterly Reviews
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quarterly appraisals, engineering competency scores &amp; manager evaluation feedback
                </p>
              </div>

              <div className="inline-flex rounded-xl p-1 bg-white border border-slate-200 shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedQuarter('q3-2026')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedQuarter === 'q3-2026'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q3 Review (Latest)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuarter('q2-2026')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedQuarter === 'q2-2026'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q2 Review
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuarter('q1-2026')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedQuarter === 'q1-2026'
                      ? 'bg-[#4338ca] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Q1 Review
                </button>
              </div>
            </div>

            {/* 3 Colorful Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#f8f9ff] rounded-xl border border-indigo-200/80 p-5 shadow-xs">
                <div className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-1">
                  Overall Rating
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-950 tracking-tight">4.8</span>
                  <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                  <div className="flex text-amber-400 ml-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Top Tier: Exceeds Role Expectations
                </p>
              </div>

              <div className="bg-[#f0fdf4] rounded-xl border border-emerald-200/80 p-5 shadow-xs">
                <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                  Appraisal Status
                </div>
                <div className="text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <span>Manager Completed</span>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Evaluated by Sarah Chen (Engineering Lead)
                </p>
              </div>

              <div className="bg-[#f0f9ff] rounded-xl border border-sky-200/80 p-5 shadow-xs">
                <div className="text-[10px] font-bold text-sky-700 tracking-wider uppercase mb-1">
                  Promotion &amp; Merit Band
                </div>
                <div className="text-2xl font-black text-sky-950 tracking-tight">
                  Tier A+ Merit
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Eligible for Lead Technical Architect track
                </p>
              </div>
            </div>

            {/* Competency Breakdown & Manager Review Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Competency Scoring Bars (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-xl border border-[#e2e8f0] p-5.5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Award size={18} className="text-indigo-600" />
                  <span>Engineering Competency Evaluation</span>
                </h3>

                <div className="space-y-3.5 pt-1">
                  {competencies.map((comp) => (
                    <div key={comp.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{comp.label}</span>
                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-slate-400 text-[11px]">Self: {comp.self}</span>
                          <span className="font-bold text-slate-900">Score: {comp.manager} / 5.0</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${comp.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${(comp.manager / 5.0) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Feedback & Comments (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Manager Comments */}
                <div className="bg-[#f8f9ff] rounded-xl border border-indigo-200/80 p-5 shadow-xs space-y-2.5">
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-indigo-600" />
                    <span>Manager Appraisal Feedback</span>
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-xl border border-indigo-100">
                    &quot;Aryan has demonstrated outstanding technical leadership in modernizing our backend integration layer and building the reactive portal. His deep knowledge of Odoo and frontend architecture directly accelerated our quarterly release schedule.&quot;
                  </p>
                  <div className="text-[11px] font-bold text-indigo-700 pt-1 text-right">
                    — Sarah Chen (Engineering Lead)
                  </div>
                </div>

                {/* Self Reflection Comments */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Employee Self-Review Remarks
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    &quot;Focused on seamless real-time JSON-RPC communication, strict error resilience, and high UI performance. Planned for Q4: Expand modular sidebars, biometrics, and automated team timesheet analytics.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

