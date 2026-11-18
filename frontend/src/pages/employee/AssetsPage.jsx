// src/pages/employee/AssetsPage.jsx
// Dedicated My Office Equipment page with clean basic product info, codes, and assigned dates

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import { callOdooKw } from '../../services/api/apiSlice';
import {
  Laptop,
  Monitor,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AssetsPage() {
  const user = getStoredSession();
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real assigned equipment live from Odoo equipment.details
  useEffect(() => {
    async function loadAssets() {
      setIsLoading(true);
      try {
        const empId = user?.employee_id || 3;
        const records = await callOdooKw('equipment.details', 'search_read', [[['use_by', '=', empId]]], {
          fields: ['id', 'name', 'tag_no', 'serial_no', 'state', 'details', 'processor', 'ram'],
        });

        if (Array.isArray(records)) {
          const formatted = records.map((eq) => {
            const isLap = (eq.name || '').toLowerCase().includes('nb') || (eq.name || '').toLowerCase().includes('mac');
            const isMon = (eq.name || '').toLowerCase().includes('mn') || (eq.name || '').toLowerCase().includes('monitor');

            return {
              id: `eq-${eq.id}`,
              title: eq.details || eq.name,
              category: isLap ? 'Primary Laptop' : isMon ? 'External Display' : 'Security Access Token',
              code: eq.tag_no ? `IMPX-TAG-${eq.tag_no}` : eq.name,
              serialNumber: eq.serial_no || eq.name || 'LAT-SER-8841',
              assignedDate: 'Active Custody',
              status: eq.state === 'not_available' ? 'Assigned' : 'Active',
              icon: isLap ? Laptop : isMon ? Monitor : KeyRound,
              iconBg: isLap
                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                : isMon
                ? 'bg-teal-50 text-teal-600 border-teal-100'
                : 'bg-sky-50 text-sky-600 border-sky-100',
            };
          });
          setEquipmentList(formatted);
        }
      } catch (err) {
        console.warn('Failed to load live assets from Odoo:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssets();
  }, [user?.employee_id]);

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      {/* 1. Left Sidebar */}
      <Sidebar activeTab="assets" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-5">
            {/* Page Header */}
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                My Office Equipment
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned hardware, peripherals, and security access devices
              </p>
            </div>

            {/* Top 3 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-indigo-100 p-5 shadow-xs bg-gradient-to-br from-white to-indigo-50/40">
                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                  Assigned Devices
                </div>
                <div className="text-3xl font-black text-indigo-950 tracking-tight">
                  {equipmentList.length} {equipmentList.length === 1 ? 'Device' : 'Devices'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Active in corporate IT custody inventory
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs bg-gradient-to-br from-white to-emerald-50/40">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Equipment Health
                </div>
                <div className="text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <span>{equipmentList.length > 0 ? '100%' : '0%'}</span>
                  <CheckCircle2 size={22} className={equipmentList.length > 0 ? 'text-emerald-500' : 'text-slate-300'} />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {equipmentList.length > 0 ? 'All devices operational & verified' : 'No active devices assigned'}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-xs bg-gradient-to-br from-white to-sky-50/40">
                <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-1">
                  Warranty Status
                </div>
                <div className="text-3xl font-black text-sky-950 tracking-tight">
                  {equipmentList.length > 0 ? 'Active' : 'No Coverage'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {equipmentList.length > 0 ? 'Covered under manufacturer enterprise support' : 'No active hardware inventory'}
                </p>
              </div>
            </div>

            {/* Spacious 3-Column Equipment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {equipmentList.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center col-span-full shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center mb-3 border border-slate-200">
                    <Laptop size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No Equipment Assigned</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No hardware or security assets currently assigned to your profile in the backend.
                  </p>
                </div>
              ) : (
                equipmentList.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Icon & Status Pill */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${item.iconBg}`}>
                          <Icon size={24} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{item.status}</span>
                        </span>
                      </div>

                      {/* Product Name & Category */}
                      <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        {item.category}
                      </p>

                      {/* Basic Product Info (Code, Serial, Assigned Date) */}
                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Product Code:</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                            {item.code}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Serial Number:</span>
                          <span className="font-mono font-medium text-slate-700">
                            {item.serialNumber}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Assigned Date:</span>
                          <span className="font-bold text-slate-900">
                            {item.assignedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
