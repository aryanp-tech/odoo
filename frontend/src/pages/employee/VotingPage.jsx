// src/pages/employee/VotingPage.jsx
// Office Polls & Announcements (synced with Odoo 14 hr.announcement and survey.survey)

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import CompanyPollsCard from '../../components/employee/CompanyPollsCard';
import { useGetEmployeeDashboardQuery, callOdooKw } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  Megaphone,
  Vote,
  Award,
  History,
  CheckCircle2,
  Users,
  FileText,
  Calendar,
  Sparkles,
  BellRing,
  Tag,
} from 'lucide-react';

export default function VotingPage() {
  const user = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const poll = dashboardData?.poll || {};

  const [announcements, setAnnouncements] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'announcements' | 'polls'
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch live announcements from Odoo hr.announcement & surveys from survey.survey
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch hr.announcement
        const annRecords = await callOdooKw('hr.announcement', 'search_read', [[]], {
          fields: ['id', 'name', 'announcement_reason', 'announcement', 'date_start', 'date_end', 'state', 'is_announcement'],
          order: 'id desc',
        });
        if (Array.isArray(annRecords)) {
          setAnnouncements(annRecords);
        }

        // Fetch survey.survey
        const surveyRecords = await callOdooKw('survey.survey', 'search_read', [[]], {
          fields: ['id', 'title', 'state', 'answer_count', 'create_date'],
        });
        if (Array.isArray(surveyRecords)) {
          setSurveys(surveyRecords.map((s) => ({
            id: String(s.id),
            title: s.title,
            winner: `${s.answer_count || 0} responses recorded`,
            votes: s.answer_count || 0,
            date: s.create_date ? new Date(s.create_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026',
            status: s.state === 'closed' ? 'Closed' : 'Active',
          })));
        }
      } catch (e) {
        console.warn('Odoo load error in VotingPage:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalVotesCount = surveys.reduce((acc, s) => acc + (Number(s.votes) || 0), 0) + (Number(poll?.totalVotes) || 0);
  const participationRate = totalVotesCount > 0 ? '100%' : '0%';

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="polls" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-5">
            {/* 1. Header Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    Office Polls &amp; Announcements
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official LatitudeTechnoLabs announcements, bulletins &amp; democratic workplace polls
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Updates
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('announcements')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === 'announcements'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Announcements</span>
                  {announcements.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {announcements.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('polls')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeFilter === 'polls'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Office Polls
                </button>
              </div>
            </div>

            {/* 2. Official Announcements Section */}
            {(activeFilter === 'all' || activeFilter === 'announcements') && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing size={16} className="text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Company Announcements &amp; Notices
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {announcements.length} Active {announcements.length === 1 ? 'Notice' : 'Notices'}
                  </span>
                </div>

                {announcements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-700 tracking-wider">
                                {ann.name || `ANN-${ann.id}`}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase">
                                {ann.state === 'approved' ? 'Active Notice' : ann.state || 'General'}
                              </span>
                            </div>
                            {(ann.date_start || ann.date_end) && (
                              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                <Calendar size={13} />
                                <span>{ann.date_start || 'Immediate'}</span>
                              </div>
                            )}
                          </div>

                          {/* Reason / Title */}
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                            {ann.announcement_reason || 'LatitudeTechnoLabs Official Notice'}
                          </h3>

                          {/* Body HTML */}
                          <div
                            className="mt-2.5 text-xs text-slate-600 leading-relaxed space-y-1.5 prose prose-xs max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: ann.announcement || '<p>No additional details provided.</p>',
                            }}
                          />
                        </div>

                        {/* Footer Info */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-medium text-slate-500">LatitudeTechnoLabs Human Resources</span>
                          {ann.date_end && (
                            <span>Valid until: {ann.date_end}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-400 text-xs">
                    No active company notices currently published.
                  </div>
                )}
              </div>
            )}

            {/* 3. Office Polls & Democratic Workplace Governance */}
            {(activeFilter === 'all' || activeFilter === 'polls') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Vote size={16} className="text-orange-600" />
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Democratic Office Polls &amp; Voting
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Active Poll Card Component */}
                  <div className="lg:col-span-6">
                    <CompanyPollsCard poll={poll} />
                  </div>

                  {/* Voting Participation Info Card */}
                  <div className="lg:col-span-6 bg-white rounded-2xl border border-indigo-100 p-6 shadow-xs bg-gradient-to-br from-white to-indigo-50/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        <h3 className="text-xs font-bold text-indigo-900 tracking-tight uppercase">
                          Democratic Workplace Governance
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        Every team member holds an equal vote on company initiatives, quarterly hackathons, and cultural events. Your vote is recorded transparently in the system.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Participation</span>
                        <span className="text-xl font-black text-slate-900">{participationRate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Votes</span>
                        <span className="text-xl font-black text-indigo-600">{totalVotesCount} Cast</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Past Polls Archive Table */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                    <History size={16} className="text-slate-400" />
                    <span>Historical Survey &amp; Poll Archive</span>
                  </h3>

                  <div className="divide-y divide-slate-100 text-xs">
                    {surveys.length > 0 ? (
                      surveys.map((p) => (
                        <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900">{p.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Status: <strong className="text-slate-800">{p.winner}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">{p.date}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No historical surveys archived.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
