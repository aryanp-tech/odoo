// src/components/employee/CreateProjectModal.jsx
// Modal allowing employees to provision a new project directly into Odoo 14 project.project

import React, { useState } from 'react';
import { X, FolderPlus, Sparkles, Shield, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { callOdooKw } from '../../services/api/apiSlice';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('employees'); // 'employees' | 'followers' | 'portal'
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdId = await callOdooKw('project.project', 'create', [{
        name: name.trim(),
        description: description.trim() || false,
        privacy_visibility: privacy,
      }]);

      toast.success(`Project "${name.trim()}" created successfully!`);
      setName('');
      setDescription('');
      setPrivacy('employees');
      if (onProjectCreated) {
        await onProjectCreated(createdId);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create project in Odoo:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#15203d] to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
              <FolderPlus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create New Project</h2>
              <p className="text-xs text-slate-300">Provision a project workspace in Odoo 14</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Application Redesign"
              className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Visibility / Access */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Visibility &amp; Access Policy
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPrivacy('employees')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  privacy === 'employees'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block">All Staff</span>
                <span className="text-[10px] opacity-75 mt-0.5">Internal team</span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('followers')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  privacy === 'followers'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block">Invited</span>
                <span className="text-[10px] opacity-75 mt-0.5">Assigned only</span>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('portal')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                  privacy === 'portal'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-400/30'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold block">Portal</span>
                <span className="text-[10px] opacity-75 mt-0.5">Client shared</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Description / Scope (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project deliverables, milestones, or client objectives..."
              className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <FolderPlus size={14} />
              <span>{isSubmitting ? 'Creating in Odoo...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
