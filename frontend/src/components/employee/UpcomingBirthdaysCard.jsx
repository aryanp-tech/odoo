// src/components/employee/UpcomingBirthdaysCard.jsx
// Professional colorful Upcoming Birthdays reminder card matching user mockup (No wish button)

import React from 'react';
import { Cake, Calendar } from 'lucide-react';

export default function UpcomingBirthdaysCard({ birthdays = [] }) {
  const items = birthdays.length > 0 ? birthdays : [
    {
      id: 'b-1',
      name: 'Sarah Chen',
      role: 'Engineering Lead',
      department: 'Core Platform Group',
      dateLabel: 'Nov 08',
      countdown: 'In 3 days 🎂',
      avatarInitials: 'SC',
      avatarBg: 'bg-rose-500',
      tagColor: 'text-rose-700 bg-rose-50 border-rose-200',
    },
    {
      id: 'b-2',
      name: 'Alex Rivera',
      role: 'Lead UI/UX Designer',
      department: 'Product Systems',
      dateLabel: 'Nov 12',
      countdown: 'Next week 🎉',
      avatarInitials: 'AR',
      avatarBg: 'bg-indigo-600',
      tagColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'b-3',
      name: 'Marcus Vance',
      role: 'DevOps & Cloud Engineer',
      department: 'Infrastructure Operations',
      dateLabel: 'Nov 18',
      countdown: 'In 13 days 🎈',
      avatarInitials: 'MV',
      avatarBg: 'bg-teal-600',
      tagColor: 'text-teal-700 bg-teal-50 border-teal-200',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#fff5f5] via-[#ffe4e6]/50 to-[#fecdd3]/40 border border-[#fecdd3] rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <Cake size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Upcoming Birthdays &amp; Milestones
              </h3>
              <span className="text-[10px] font-mono text-rose-700 bg-white/90 px-1.5 py-0.2 rounded border border-rose-200 shadow-2xs">
                hr.employee.birthday
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Teammate celebration reminders this month • Informative notice
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-rose-700 border border-rose-200 shadow-2xs self-start sm:self-auto">
          3 Upcoming
        </span>
      </div>

      {/* Birthday Informative Cards */}
      <div className="space-y-3">
        {items.map((person) => (
          <div
            key={person.id}
            className="p-3.5 rounded-xl border border-rose-100 bg-white hover:border-rose-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-full ${person.avatarBg} text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0`}
              >
                {person.avatarInitials}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {person.name}
                  </h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Calendar size={11} />
                    <span>{person.dateLabel}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {person.role} • <span className="font-medium text-slate-700">{person.department}</span>
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${person.tagColor}`}>
                {person.countdown}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
