// src/components/employee/CompanyPollsCard.jsx
// Clean Office Pulse Poll (no technical model labels or extra subtext)

import React, { useState } from 'react';
import { Vote, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitPollVoteMutation } from '../../services/api/apiSlice';

export default function CompanyPollsCard({ poll = {} }) {
  const [submitVote, { isLoading }] = useSubmitPollVoteMutation();
  const [selectedOpt, setSelectedOpt] = useState(poll.userVotedId || 'opt-1');

  const options = poll.options || [
    { id: 'opt-1', label: 'AI Agents & Workflow Automation', percentage: 62 },
    { id: 'opt-2', label: 'Green Tech & Sustainable Cloud', percentage: 24 },
    { id: 'opt-3', label: 'Developer Experience & Tooling', percentage: 14 },
  ];

  const handleVoteSubmit = async () => {
    try {
      await submitVote({ optionId: selectedOpt }).unwrap();
      toast.success('Your vote has been counted!');
    } catch (err) {
      toast.error('Failed to submit vote');
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#fff7ed] via-[#ffedd5]/60 to-[#fed7aa]/40 border border-[#fed7aa] rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-orange-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center shrink-0">
            <Vote size={16} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            Office Pulse Poll
          </h3>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-orange-800 border border-orange-200 shadow-2xs">
          Open Vote
        </span>
      </div>

      {/* Poll Topic */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-orange-600" />
          <span>Q4 Hackathon Theme Selection</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-orange-100">
          ends in 3d
        </span>
      </div>

      {/* Radio Options List with Progress Fills */}
      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = selectedOpt === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedOpt(opt.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden shadow-2xs ${
                isSelected
                  ? 'border-orange-500 bg-white ring-2 ring-orange-200'
                  : 'border-orange-200/80 bg-white/90 hover:border-orange-300'
              }`}
            >
              {/* Background progress fill */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-orange-100/60 -z-0 transition-all duration-300 pointer-events-none"
                style={{ width: `${opt.percentage}%` }}
              />

              <div className="relative z-10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-orange-600 bg-orange-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isSelected ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                <span className="font-mono font-bold text-slate-800 text-xs bg-white/80 px-1.5 py-0.2 rounded border border-orange-100">
                  {opt.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Button: Submit Vote */}
      <button
        type="button"
        onClick={handleVoteSubmit}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
      >
        <Check size={14} />
        <span>{isLoading ? 'Submitting Ballot...' : 'Submit My Vote'}</span>
      </button>
    </div>
  );
}
