// src/pages/employee/PerformancePage.jsx
// Performance Management System & Quarterly Review (synced with Odoo quarterly.review)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import { callOdooKw } from '../../services/api/apiSlice';
import {
  Award,
  Star,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Calendar,
  MessageSquare,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function PerformancePage() {
  const user = getStoredSession();
  const [reviews, setReviews] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load real reviews live from Odoo quarterly.review
  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const empId = user?.employee_id || 3;
        const records = await callOdooKw('quarterly.review', 'search_read', [[['name', '=', empId]]], {
          fields: [
            'id',
            'quarter_name',
            'state',
            'quality_work',
            'quality_work_manager',
            'job_knowledge',
            'job_knowledge_manager',
            'quantity_work',
            'quantity_work_manager',
            'reliability',
            'reliability_manager',
            'communication',
            'communication_manager',
            'adaptability',
            'adaptability_manager',
            'attendance',
            'attendance_manager',
            'overal_comments',
            'manager_overal_comments',
          ],
          order: 'id desc',
        });

        if (Array.isArray(records) && records.length > 0) {
          setReviews(records);
          const latest = records[0];
          setSelectedReview(latest);
          setCompetencies([
            { label: 'Quality of Work', self: Number(latest.quality_work) || 0, manager: Number(latest.quality_work_manager) || 0, color: 'bg-indigo-600' },
            { label: 'Technical & Job Knowledge', self: Number(latest.job_knowledge) || 0, manager: Number(latest.job_knowledge_manager) || 0, color: 'bg-teal-600' },
            { label: 'Quantity & Sprint Velocity', self: Number(latest.quantity_work) || 0, manager: Number(latest.quantity_work_manager) || 0, color: 'bg-sky-600' },
            { label: 'System Reliability & Uptime', self: Number(latest.reliability) || 0, manager: Number(latest.reliability_manager) || 0, color: 'bg-emerald-600' },
            { label: 'Communication & Team Synergy', self: Number(latest.communication) || 0, manager: Number(latest.communication_manager) || 0, color: 'bg-purple-600' },
            { label: 'Adaptability & Problem Solving', self: Number(latest.adaptability) || 0, manager: Number(latest.adaptability_manager) || 0, color: 'bg-amber-600' },
            { label: 'Attendance & Punctuality', self: Number(latest.attendance) || 0, manager: Number(latest.attendance_manager) || 0, color: 'bg-rose-600' },
          ]);
        } else {
          setReviews([]);
          setCompetencies([]);
          setSelectedReview(null);
        }
      } catch (err) {
        console.warn('Odoo quarterly.review load warning:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [user?.employee_id]);

  const avgManagerScore = competencies.length > 0
    ? (competencies.reduce((acc, c) => acc + c.manager, 0) / competencies.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="performance" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Header with Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Performance &amp; Appraisals
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quarterly engineering evaluations, competencies breakdown &amp; reviewer feedback
                </p>
              </div>

              {reviews.length > 0 && (
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
                  {reviews.map((rev) => (
                    <button
                      key={rev.id}
                      type="button"
                      onClick={() => {
                        setSelectedReview(rev);
                        setCompetencies([
                          { label: 'Quality of Work', self: Number(rev.quality_work) || 0, manager: Number(rev.quality_work_manager) || 0, color: 'bg-indigo-600' },
                          { label: 'Technical & Job Knowledge', self: Number(rev.job_knowledge) || 0, manager: Number(rev.job_knowledge_manager) || 0, color: 'bg-teal-600' },
                          { label: 'Quantity & Sprint Velocity', self: Number(rev.quantity_work) || 0, manager: Number(rev.quantity_work_manager) || 0, color: 'bg-sky-600' },
                          { label: 'System Reliability & Uptime', self: Number(rev.reliability) || 0, manager: Number(rev.reliability_manager) || 0, color: 'bg-emerald-600' },
                          { label: 'Communication & Team Synergy', self: Number(rev.communication) || 0, manager: Number(rev.communication_manager) || 0, color: 'bg-purple-600' },
                          { label: 'Adaptability & Problem Solving', self: Number(rev.adaptability) || 0, manager: Number(rev.adaptability_manager) || 0, color: 'bg-amber-600' },
                          { label: 'Attendance & Punctuality', self: Number(rev.attendance) || 0, manager: Number(rev.attendance_manager) || 0, color: 'bg-rose-600' },
                        ]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedReview?.id === rev.id
                          ? 'bg-[#4338ca] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {rev.quarter_name || `Review #${rev.id}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-3 border border-indigo-100">
                  <Award size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Performance Reviews Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No quarterly appraisal reviews are currently recorded in the backend. When evaluations are created in Odoo, they will dynamically appear here.
                </p>
              </div>
            ) : (
              <>
                {/* 3 Colorful Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="bg-[#f8f9ff] rounded-xl border border-indigo-200/80 p-5 shadow-xs">
                    <div className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-1">
                      Overall Rating
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-950 tracking-tight">{avgManagerScore}</span>
                      <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                      <div className="flex text-amber-400 ml-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={15} fill={i <= Math.round(Number(avgManagerScore)) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {Number(avgManagerScore) >= 4 ? 'Top Tier: Exceeds Role Expectations' : 'Evaluated Performance'}
                    </p>
                  </div>

                  <div className="bg-[#f0fdf4] rounded-xl border border-emerald-200/80 p-5 shadow-xs">
                    <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                      Appraisal Status
                    </div>
                    <div className="text-2xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                      <span>{selectedReview?.state === 'done' ? 'Completed' : 'Recorded'}</span>
                      <CheckCircle2 size={20} className="text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Quarterly Review Evaluation
                    </p>
                  </div>

                  <div className="bg-[#f0f9ff] rounded-xl border border-sky-200/80 p-5 shadow-xs">
                    <div className="text-[10px] font-bold text-sky-700 tracking-wider uppercase mb-1">
                      Review Quarter
                    </div>
                    <div className="text-2xl font-black text-sky-950 tracking-tight">
                      {selectedReview?.quarter_name || 'Active Cycle'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Backend Appraisal Cycle
                    </p>
                  </div>
                </div>

                {/* Competency Breakdown & Manager Review Comments */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left: Competency Scoring Bars (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-xl border border-[#e2e8f0] p-5.5 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Award size={18} className="text-indigo-600" />
                      <span>Competency Evaluation</span>
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
                        {selectedReview?.manager_overal_comments || 'No manager comments recorded yet.'}
                      </p>
                    </div>

                    {/* Self Reflection Comments */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Employee Self-Review Remarks
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        {selectedReview?.overal_comments || 'No self-review comments recorded yet.'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
