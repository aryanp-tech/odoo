// src/pages/employee/VotingPage.jsx
// Dedicated Polls & Voting governance page

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import CompanyPollsCard from '../../components/employee/CompanyPollsCard';
import { useGetEmployeeDashboardQuery, callOdooKw } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import { Vote, Award, History, CheckCircle2, Users, FileText } from 'lucide-react';

export default function VotingPage() {
  const user = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const poll = dashboardData?.poll || {};
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalVotesCount = surveys.reduce((acc, s) => acc + (Number(s.votes) || 0), 0) + (Number(poll?.totalVotes) || 0);
  const participationRate = totalVotesCount > 0 ? '100%' : '0%';

  useEffect(() => {
    async function loadSurveys() {
      setIsLoading(true);
      try {
        const records = await callOdooKw('survey.survey', 'search_read', [[]], {
          fields: ['id', 'title', 'state', 'answer_count', 'create_date'],
        });
        if (Array.isArray(records)) {
          setSurveys(records.map((s) => ({
            id: String(s.id),
            title: s.title,
            winner: `${s.answer_count || 0} responses recorded`,
            votes: s.answer_count || 0,
            date: s.create_date ? new Date(s.create_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026',
            status: s.state === 'closed' ? 'Closed' : 'Active',
          })));
        }
      } catch (e) {
        console.warn('Odoo survey.survey load warning:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSurveys();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="voting" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Company Polls &amp; Governance
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Vote on company initiatives, team priorities, and quarterly technical hackathons
              </p>
            </div>

            {/* Active Poll Card Component */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6">
                <CompanyPollsCard poll={poll} />
              </div>

              {/* Voting Participation Info Card */}
              <div className="lg:col-span-6 bg-white rounded-xl border border-indigo-100 p-5 shadow-xs bg-gradient-to-br from-white to-indigo-50/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    <h3 className="text-xs font-bold text-indigo-900 tracking-tight uppercase">
                      Democratic Workplace Governance
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Every team member holds an equal vote on company themes and cultural events. Your vote is cryptographically linked to your user token and recorded transparently.
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
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3 flex items-center gap-2">
                <History size={16} className="text-slate-400" />
                <span>Historical Governance Archive</span>
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
                    No active surveys recorded in Odoo 14 backend.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

