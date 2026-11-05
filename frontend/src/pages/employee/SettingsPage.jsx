// src/pages/employee/SettingsPage.jsx
// Dedicated Employee Profile & Portal Settings page with reactive live updates

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import {
  useGetEmployeeDashboardQuery,
  useUpdateProfileMutation,
} from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  User,
  Mail,
  Building,
  MapPin,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const current = dashboardData?.user || getStoredSession();

  const [profile, setProfile] = useState({
    name: current.name || 'Aryan Patel',
    email: current.email || 'aryan.p@latitudetechnolabs.org',
    job_title: current.job_title || 'Software Engineer',
    department: current.department || 'Core Platform Engineering Group',
    location: current.location || 'Munich Tech Center',
    standard_hours: current.standard_hours || '09:00 - 17:00',
    notifyAttendance: true,
    notifyLeaves: true,
  });

  useEffect(() => {
    if (dashboardData?.user) {
      setProfile((prev) => ({
        ...prev,
        name: dashboardData.user.name || prev.name,
        email: dashboardData.user.email || prev.email,
        job_title: dashboardData.user.job_title || prev.job_title,
        department: dashboardData.user.department || prev.department,
        location: dashboardData.user.location || prev.location,
        standard_hours: dashboardData.user.standard_hours || prev.standard_hours,
      }));
    }
  }, [dashboardData?.user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile).unwrap();
      toast.success('Profile updated & synchronized across your dashboard!', {
        icon: '✨',
      });
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="settings" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={profile} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto space-y-4.5">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Profile &amp; Account Settings
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Changes saved here reflect live on your ESS Dashboard, Welcome greeting &amp; top navbar
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-xs space-y-4 bg-gradient-to-br from-white to-indigo-50/20">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <User size={16} className="text-indigo-600" />
                  <span>Personal &amp; Organizational Profile</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Aryan Patel"
                      className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="job_title"
                      value={profile.job_title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={profile.department}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Core Engineering Platform"
                      className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Work Location Hub
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Munich Tech Center"
                      className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Standard Daily Shift
                    </label>
                    <input
                      type="text"
                      name="standard_hours"
                      value={profile.standard_hours}
                      onChange={handleChange}
                      placeholder="09:00 - 17:00"
                      className="w-full bg-[#f8fafc] text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="bg-white rounded-xl border border-teal-100 p-5 shadow-xs space-y-3 bg-gradient-to-br from-white to-teal-50/20">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Bell size={16} className="text-teal-600" />
                  <span>Notification Preferences</span>
                </h3>

                <div className="space-y-2 pt-1 text-xs">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="notifyAttendance"
                      checked={profile.notifyAttendance}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-medium text-slate-700">
                      Send daily shift punch-in &amp; punch-out reminders
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="notifyLeaves"
                      checked={profile.notifyLeaves}
                      onChange={handleChange}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-medium text-slate-700">
                      Send leave request approval and manager status alerts
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving...' : 'Save & Sync Dashboard'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
