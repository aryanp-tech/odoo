// src/components/employee/LeavesCalendarView.jsx
// Interactive Monthly Time Off Calendar matching Odoo portal mockup with Company Holidays & Filter Sidebar

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Building,
  Clock,
  Info,
} from 'lucide-react';

export default function LeavesCalendarView({ onRequestLeave }) {
  // Calendar current view date (defaults to November 2026 matching user mockup)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Month is 0-indexed: 10 = Nov
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filter toggles matching right panel in mockup:
  const [filters, setFilters] = useState({
    wfh: true,
    casual: true,
    sick: true,
    holiday: true,
  });

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Leaves & Holidays data matching the mockup exactly
  const allEvents = [
    {
      id: 'evt-1',
      dateStr: '2026-11-09',
      dayNumber: 9,
      type: 'casual',
      title: 'Going to village',
      duration: '1.00 days',
      colorLine: '#eab308', // Amber/Yellow
      tagBg: 'bg-amber-50',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-400',
      managerApproval: { name: 'Sarah Chen (Lead)', status: 'Approved' },
      hrApproval: { name: 'HR Operations', status: 'Approved' },
      notes: 'Family visit to ancestral village',
    },
    {
      id: 'evt-2',
      dateStr: '2026-11-12',
      dayNumber: 12,
      type: 'casual',
      title: 'going home',
      duration: '1.00 days',
      colorLine: '#eab308', // Amber/Yellow
      tagBg: 'bg-amber-50',
      textColor: 'text-amber-900',
      borderColor: 'border-amber-400',
      managerApproval: { name: 'Sarah Chen (Lead)', status: 'Approved' },
      hrApproval: { name: 'HR Operations', status: 'Pending HR Approval' },
      notes: 'Travel transit day',
    },
    {
      id: 'evt-3',
      dateStr: '2026-11-13',
      dayNumber: 13,
      type: 'wfh',
      title: 'Request WFM cause Go...',
      fullTitle: 'Request WFH cause Going Out of Station',
      duration: '1.00 days',
      colorLine: '#9333ea', // Purple
      tagBg: 'bg-purple-50',
      textColor: 'text-purple-900',
      borderColor: 'border-purple-400',
      managerApproval: { name: 'Sarah Chen (Lead)', status: 'Approved' },
      hrApproval: { name: 'HR Operations', status: 'Approved' },
      notes: 'Remote workday with stable fiber connectivity',
    },
    {
      id: 'evt-4',
      dateStr: '2026-11-26',
      dayNumber: 26,
      type: 'holiday',
      title: 'Thanksgiving Holiday',
      duration: 'Official Holiday',
      colorLine: '#10b981', // Emerald
      tagBg: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      borderColor: 'border-emerald-500',
      managerApproval: { name: 'Automatic', status: 'Company Wide' },
      hrApproval: { name: 'Corporate HR', status: 'Gazetted Holiday' },
      notes: 'Latitude Techno Labs Global Office Holiday',
    },
    {
      id: 'evt-5',
      dateStr: '2026-11-27',
      dayNumber: 27,
      type: 'holiday',
      title: 'Post-Thanksgiving Friday',
      duration: 'Official Holiday',
      colorLine: '#10b981', // Emerald
      tagBg: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      borderColor: 'border-emerald-500',
      managerApproval: { name: 'Automatic', status: 'Company Wide' },
      hrApproval: { name: 'Corporate HR', status: 'Gazetted Holiday' },
      notes: 'Corporate bridge holiday',
    },
  ];

  // Filtered events
  const visibleEvents = allEvents.filter((evt) => filters[evt.type]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 10, 1));
  };

  // Month metadata
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute calendar days
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Week numbers for November 2026: 45, 46, 47, 48, 49, 50
  const weekNumbers = [45, 46, 47, 48, 49, 50];

  // Build grid of 6 weeks x 7 days = 42 cells
  const calendarCells = [];
  let dayCounter = 1;
  let nextMonthCounter = 1;

  for (let i = 0; i < 42; i++) {
    if (i < firstDayIndex) {
      // Previous month overflow
      const prevDate = daysInPrevMonth - firstDayIndex + i + 1;
      calendarCells.push({
        day: prevDate,
        isCurrentMonth: false,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`,
      });
    } else if (dayCounter <= daysInMonth) {
      // Current month day
      calendarCells.push({
        day: dayCounter,
        isCurrentMonth: true,
        isToday: dayCounter === 5 && month === 10 && year === 2026, // Thursday Nov 5 red circle
        dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`,
      });
      dayCounter++;
    } else {
      // Next month overflow
      calendarCells.push({
        day: nextMonthCounter,
        isCurrentMonth: false,
        dateStr: `${year}-${String(month + 2).padStart(2, '0')}-${String(nextMonthCounter).padStart(2, '0')}`,
      });
      nextMonthCounter++;
    }
  }

  // Group into weeks
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    weeks.push({
      weekNum: weekNumbers[w] || 45 + w,
      days: calendarCells.slice(w * 7, (w + 1) * 7),
    });
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* 1. Calendar Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <CalendarIcon size={15} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {monthName}
            </h2>
            <p className="text-[10px] text-slate-500">
              Company Holidays &amp; Bi-Approval Time Off Schedule
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer border-r border-slate-200"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer border-l border-slate-200"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={onRequestLeave}
            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] transition-colors cursor-pointer shadow-2xs"
          >
            + New Request
          </button>
        </div>
      </div>

      {/* 2. Main Calendar Body with Right Filter Sidebar (Compact Sizing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        {/* Left: 7-Day Monthly Grid (10 cols on lg) */}
        <div className="lg:col-span-10 border-b lg:border-b-0 lg:border-r border-slate-200/80 overflow-x-auto">
          <div className="min-w-[660px]">
            {/* Weekday Names Header */}
            <div className="grid grid-cols-[36px_repeat(7,1fr)] border-b border-slate-200 text-center text-[11px] font-bold text-slate-600 bg-slate-50/70 py-1.5">
              <div className="text-[9px] font-mono text-slate-400 flex items-center justify-center">
                Wk
              </div>
              <div>Sunday</div>
              <div>Monday</div>
              <div>Tuesday</div>
              <div>Wednesday</div>
              <div>Thursday</div>
              <div>Friday</div>
              <div>Saturday</div>
            </div>

            {/* Weeks & Days Grid */}
            <div className="divide-y divide-slate-100">
              {weeks.map((week) => (
                <div
                  key={week.weekNum}
                  className="grid grid-cols-[36px_repeat(7,1fr)] min-h-[72px] divide-x divide-slate-100"
                >
                  {/* Week Number Column */}
                  <div className="bg-slate-50/40 text-[10px] font-mono font-semibold text-slate-400 flex items-center justify-center border-r border-slate-100 select-none">
                    {week.weekNum}
                  </div>

                  {/* 7 Days in Week */}
                  {week.days.map((cell, idx) => {
                    // Check if day is weekend (0 = Sunday, 6 = Saturday)
                    const isWeekend = idx === 0 || idx === 6;
                    // Find events on this date
                    const dayEvents = cell.isCurrentMonth
                      ? visibleEvents.filter((e) => e.dateStr === cell.dateStr)
                      : [];

                    return (
                      <div
                        key={idx}
                        className={`p-1 flex flex-col justify-between transition-colors relative ${
                          cell.isCurrentMonth
                            ? isWeekend
                              ? 'bg-slate-50/40'
                              : 'bg-white hover:bg-slate-50/60'
                            : 'bg-slate-100/30 text-slate-300'
                        }`}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-end">
                          {cell.isToday ? (
                            <span className="w-5 h-5 rounded-full bg-[#ef4444] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                              {cell.day}
                            </span>
                          ) : (
                            <span
                              className={`text-[11px] font-semibold px-0.5 ${
                                cell.isCurrentMonth
                                  ? isWeekend
                                    ? 'text-slate-400'
                                    : 'text-slate-700'
                                  : 'text-slate-300'
                              }`}
                            >
                              {cell.day}
                            </span>
                          )}
                        </div>

                        {/* Events Chips inside Day Box */}
                        <div className="space-y-0.5 my-0.5">
                          {dayEvents.map((evt) => (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => setSelectedEvent(evt)}
                              className={`w-full text-left rounded px-1.5 py-0.5 text-[9.5px] font-medium border-l-[3px] shadow-2xs hover:brightness-95 transition-all cursor-pointer truncate leading-tight ${evt.tagBg} ${evt.textColor} ${evt.borderColor}`}
                              title={`${evt.title} (${evt.duration})`}
                            >
                              <span className="font-semibold">{evt.title}</span> :{' '}
                              <span className="text-[8.5px]">{evt.duration}</span>
                            </button>
                          ))}
                        </div>

                        {/* Empty spacer */}
                        <div />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Time Off Type Filter Sidebar (Compact Sizing) */}
        <div className="lg:col-span-2 p-4 bg-white space-y-4">
          <div>
            <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-100">
              Time Off Type
            </h3>

            {/* Checkbox Filter Options */}
            <div className="space-y-2.5 mt-2.5">
              {/* Option 1: Work From Home (Purple) */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.wfh}
                  onChange={() => toggleFilter('wfh')}
                  className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
                <span className="text-[11px]">Work From Home</span>
              </label>

              {/* Option 2: Casual Leave 2026 (Amber) */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.casual}
                  onChange={() => toggleFilter('casual')}
                  className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                />
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-[11px]">Casual Leave 2026</span>
              </label>

              {/* Option 3: Sick Leave 2026 (Teal) */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.sick}
                  onChange={() => toggleFilter('sick')}
                  className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                />
                <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0"></span>
                <span className="text-[11px]">Sick Leave 2026</span>
              </label>

              {/* Option 4: Company Holidays (Emerald) */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.holiday}
                  onChange={() => toggleFilter('holiday')}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                <span className="text-[11px]">Company Holidays</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Event Detail Modal / Drawer (When clicking any calendar leave) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${selectedEvent.tagBg} ${selectedEvent.textColor} ${selectedEvent.borderColor}`}
                >
                  {selectedEvent.type === 'wfh'
                    ? 'Work From Home'
                    : selectedEvent.type === 'holiday'
                    ? 'Gazetted Holiday'
                    : 'Casual / Paid Leave'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                  {selectedEvent.fullTitle || selectedEvent.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Event Metadata */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Scheduled Date:</span>
                <span className="font-bold text-slate-800">{selectedEvent.dateStr}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Duration:</span>
                <span className="font-bold text-slate-800">{selectedEvent.duration}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Remarks / Reason:</span>
                <span className="font-medium text-slate-700 text-right">{selectedEvent.notes}</span>
              </div>
            </div>

            {/* Unified Approval Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Approval Status:</span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                  selectedEvent.hrApproval?.status === 'Approved' ||
                  selectedEvent.hrApproval?.status === 'Gazetted Holiday'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {selectedEvent.hrApproval?.status === 'Approved' ||
                selectedEvent.hrApproval?.status === 'Gazetted Holiday'
                  ? 'Approved'
                  : 'Pending'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

