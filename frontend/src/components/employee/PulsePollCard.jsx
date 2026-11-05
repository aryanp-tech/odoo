// src/components/employee/PulsePollCard.jsx
// Office Pulse Poll interactive widget with dynamic voting & live percentage bars

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSubmitPollVoteMutation } from '../../services/api/apiSlice';

export default function PulsePollCard({ poll = {} }) {
  const [submitVote, { isLoading }] = useSubmitPollVoteMutation();
  const [selectedOption, setSelectedOption] = useState(poll.userVotedOptionId || 'opt-1');

  const options = poll.options || [
    { id: 'opt-1', label: 'Neapolitan Pizza Place', percentage: 62 },
    { id: 'opt-2', label: 'Vietnamese Street Food', percentage: 38 },
  ];

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }
    try {
      await submitVote({ optionId: selectedOption }).unwrap();
      toast.success('Your vote has been recorded! 🍕', { icon: '🗳️' });
    } catch (err) {
      toast.error('Failed to submit vote');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Office Pulse Poll
            </h3>
            <span className="text-[10px] font-mono font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              employee.voting
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {poll.subtext || 'Quick team choice'}
          </p>
        </div>
      </div>

      {/* Question */}
      <h4 className="text-xs font-bold text-slate-800 mb-3">
        {poll.question || 'Next Team Lunch Preference (Friday)'}
      </h4>

      {/* Options with percentages & radio */}
      <div className="space-y-2.5 mb-4">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/20 shadow-2xs'
                  : 'border-[#e2e8f0] hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3 relative z-10 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span
                    className={`truncate font-medium ${
                      isSelected ? 'text-indigo-950 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-700 shrink-0">
                  {opt.percentage}%
                </span>
              </div>

              {/* Background fill percentage bar */}
              <div
                className="absolute inset-y-0 left-0 bg-indigo-100/40 rounded-xl transition-all duration-500 pointer-events-none"
                style={{ width: `${opt.percentage}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Submit Action Button */}
      <button
        type="button"
        onClick={handleVote}
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Vote'}
      </button>
    </div>
  );
}

