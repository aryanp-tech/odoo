// src/pages/employee/VotingPage.jsx
// Dedicated Polls & Voting governance page

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import CompanyPollsCard from '../../components/employee/CompanyPollsCard';
import { useGetEmployeeDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import { Vote, Award, History, CheckCircle2, Users } from 'lucide-react';

export default function VotingPage() {
  const user = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const poll = dashboardData?.poll || {};

  const pastPolls = [
    {
      id: 'past-1',
      title: 'Q3 Cloud Infrastructure Migration (AWS vs GCP)',
      winner: 'Hybrid Cloud Architecture with Terraform',
      votes: 388,
      date: 'Aug 2026',
      status: 'Closed & Adopted',
    },
    {
      id: 'past-2',
      title: 'Annual Team Retreat Destination',
      winner: 'Alps Mountain Resort (Austria)',
      votes: 420,
      date: 'May 2026',
      status: 'Completed',
    },
    {
      id: 'past-3',
      title: 'Ergonomic Workstation & Hardware Stipend Scheme',
      winner: 'Flexible Annual Allowance ($1,200/yr)',
      votes: 450,
      date: 'Jan 2026',
      status: 'Implemented',
    },
  ];

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
                    <span className="text-xl font-black text-slate-900">74%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Votes</span>
                    <span className="text-xl font-black text-indigo-600">412 Cast</span>
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
                {pastPolls.map((p) => (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{p.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Selected: <strong className="text-slate-800">{p.winner}</strong> • {p.votes} votes cast
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{p.date}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

