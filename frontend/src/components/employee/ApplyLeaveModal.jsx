// src/components/employee/ApplyLeaveModal.jsx
// Clean & Scrollable Leave & WFH application modal dialog

import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmitLeaveRequestMutation } from '../../services/api/apiSlice';

export default function ApplyLeaveModal({ isOpen, onClose }) {
  const [submitLeave, { isLoading }] = useSubmitLeaveRequestMutation();

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    days: 1,
    reason: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const typeLabel =
        formData.leaveType === 'casual'
          ? 'Casual Leave 2026'
          : formData.leaveType === 'wfh'
          ? 'Work From Home'
          : formData.leaveType === 'sick'
          ? 'Sick Leave 2026'
          : 'Compensatory Off';

      await submitLeave({
        leaveType: formData.leaveType,
        leaveLabel: typeLabel,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: formData.days,
        reason: formData.reason,
      }).unwrap();

      toast.success(`${typeLabel} application submitted successfully!`);
      onClose();
    } catch (err) {
      toast.error('Failed to submit leave application');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              <Calendar size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Apply for Time Off / Leave
              </h3>
              <p className="text-[11px] text-slate-400">
                Submit time-off or remote work request
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Time Off Type
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
            >
              <option value="casual">Casual Leave 2026 (1 / 3 Days Left • 2 Taken)</option>
              <option value="wfh">Work From Home (5 / 6 Days Left • 1 Taken)</option>
              <option value="sick">Sick Leave 2026 (3 / 3 Days Left • 0 Taken)</option>
              <option value="comp_off">Compensatory Off (2 Days Available)</option>
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          {/* Duration (Days) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Duration (Days)
            </label>
            <input
              type="number"
              name="days"
              min="0.5"
              step="0.5"
              value={formData.days}
              onChange={handleChange}
              required
              className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              name="reason"
              rows={3}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Provide context for your leave request..."
              className="w-full bg-[#f8fafc] text-xs font-medium text-slate-800 placeholder:text-slate-400 rounded-xl p-3 border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
