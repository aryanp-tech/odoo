// src/pages/employee/AssetsPage.jsx
// Dedicated Assets & Equipment custody page

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { useGetEmployeeDashboardQuery } from '../../services/api/apiSlice';
import { getStoredSession } from '../../services/authService';
import {
  Laptop,
  Monitor,
  KeyRound,
  ShieldCheck,
  Wrench,
  Download,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AssetsPage() {
  const user = getStoredSession();
  const { data: dashboardData } = useGetEmployeeDashboardQuery();
  const assets = dashboardData?.assets || [];

  const handleSupport = (title) => {
    toast.success(`IT Service ticket created for ${title}`);
  };

  const handleDownloadCert = () => {
    toast.success('Downloading Custody Handover Certificate (PDF)');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="assets" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Header with Title & Download Cert */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Assets &amp; Equipment Custody
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official hardware peripherals, assigned computing workstations &amp; access credentials
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadCert}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Download size={14} className="text-slate-500" />
                <span>Custody Certificate</span>
              </button>
            </div>

            {/* 3 Colorful Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white rounded-xl border border-indigo-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-indigo-50/30">
                <div className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-1">
                  Assigned Devices
                </div>
                <div className="text-3xl font-black text-indigo-950 tracking-tight">
                  {assets.length || 3}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  All items verified under your employee ID
                </p>
              </div>

              <div className="bg-white rounded-xl border border-emerald-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
                <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                  Hardware Health
                </div>
                <div className="text-3xl font-black text-emerald-950 tracking-tight flex items-center gap-2">
                  <span>100%</span>
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Passed latest IT diagnostic &amp; security check
                </p>
              </div>

              <div className="bg-white rounded-xl border border-sky-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-sky-50/30">
                <div className="text-[10px] font-bold text-sky-700 tracking-wider uppercase mb-1">
                  Warranty Status
                </div>
                <div className="text-3xl font-black text-sky-950 tracking-tight">
                  Active
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Covered under AppleCare+ &amp; Dell ProSupport (2027)
                </p>
              </div>
            </div>

            {/* Detailed Hardware Equipment List */}
            <div className="space-y-3">
              {/* Item 1: MacBook Pro */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs hover:border-indigo-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Laptop size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          Apple MacBook Pro 16&quot; (Space Black)
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Optimal Health
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Processor</span>
                          <span className="font-semibold text-slate-800">Apple M3 Max (16-Core)</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Memory</span>
                          <span className="font-semibold text-slate-800">64GB Unified RAM</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Storage</span>
                          <span className="font-semibold text-slate-800">2TB NVMe PCIe SSD</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Asset Tag</span>
                          <span className="font-mono font-bold text-slate-800">IMPX-NB-012</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSupport('MacBook Pro 16"')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer self-start md:self-auto shrink-0"
                  >
                    <Wrench size={13} className="text-slate-400" />
                    <span>Request Service</span>
                  </button>
                </div>
              </div>

              {/* Item 2: Dell Monitor */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs hover:border-teal-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <Monitor size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          Dell UltraSharp 32&quot; 4K USB-C Hub Monitor (U3223QE)
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                          Desk Munich D2-04
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Resolution</span>
                          <span className="font-semibold text-slate-800">3840 x 2160 (4K UHD)</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Connectivity</span>
                          <span className="font-semibold text-slate-800">90W USB-C Power Delivery</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Panel</span>
                          <span className="font-semibold text-slate-800">IPS Black Technology</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Asset Tag</span>
                          <span className="font-mono font-bold text-slate-800">IMPX-MN-114</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSupport('Dell Monitor')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer self-start md:self-auto shrink-0"
                  >
                    <Wrench size={13} className="text-slate-400" />
                    <span>Request Service</span>
                  </button>
                </div>
              </div>

              {/* Item 3: YubiKey */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs hover:border-sky-200 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <KeyRound size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          YubiKey 5C NFC Enterprise Security Key
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                          2FA Hardware Enrolled
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Protocols</span>
                          <span className="font-semibold text-slate-800">FIDO2, U2F, WebAuthn</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Form Factor</span>
                          <span className="font-semibold text-slate-800">USB-C + NFC Wireless</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Vault Sync</span>
                          <span className="font-semibold text-slate-800">Active (HQ Vault)</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Hardware ID</span>
                          <span className="font-mono font-bold text-slate-800">6APX-SEC-9122</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSupport('YubiKey')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer self-start md:self-auto shrink-0"
                  >
                    <Wrench size={13} className="text-slate-400" />
                    <span>Report Lost / Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

