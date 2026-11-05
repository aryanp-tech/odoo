// src/pages/employee/InfrastructurePage.jsx
// Dedicated IT & Infrastructure Credentials, Keycard & VPN page

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import {
  Server,
  Shield,
  Wifi,
  KeyRound,
  Lock,
  ExternalLink,
  CheckCircle2,
  Terminal,
  LifeBuoy,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function InfrastructurePage() {
  const user = getStoredSession();

  const handleCreateTicket = () => {
    toast.success('Support ticket draft created for IT Infrastructure team');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      <Sidebar activeTab="infrastructure" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4.5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  IT &amp; Infrastructure
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Building access credentials, developer network tunnels &amp; cloud authorization
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateTicket}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#4338ca] hover:bg-[#3730a3] shadow-xs shadow-indigo-100 transition-all cursor-pointer self-start sm:self-auto"
              >
                <LifeBuoy size={14} />
                <span>New IT Ticket</span>
              </button>
            </div>

            {/* 3 Colorful Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-white rounded-xl border border-indigo-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-indigo-50/30">
                <div className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase mb-1">
                  Corporate VPN Tunnel
                </div>
                <div className="text-2xl font-black text-indigo-950 tracking-tight flex items-center gap-2">
                  <span>Connected</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Node: HQ-EMEA-01 (WireGuard 10.42.0.12)
                </p>
              </div>

              <div className="bg-white rounded-xl border border-emerald-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
                <div className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                  Office Keycard NFC
                </div>
                <div className="text-2xl font-black text-emerald-950 tracking-tight">
                  Active Badge
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Turnstiles, Floor 4 &amp; Server Room Pass
                </p>
              </div>

              <div className="bg-white rounded-xl border border-purple-100 p-4.5 shadow-xs bg-gradient-to-br from-white to-purple-50/30">
                <div className="text-[10px] font-bold text-purple-700 tracking-wider uppercase mb-1">
                  IAM Developer Roles
                </div>
                <div className="text-2xl font-black text-purple-950 tracking-tight">
                  Super Admin
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Production Cloud Systems, Kubernetes &amp; DB
                </p>
              </div>
            </div>

            {/* Infrastructure Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Access Passes & Hardware Credentials */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <KeyRound size={17} className="text-indigo-600" />
                  <span>Physical &amp; Hardware Access Passes</span>
                </h3>

                <div className="space-y-2.5 pt-1">
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        RFID Building Smart Badge
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Card ID: <strong className="text-slate-700">TXY-MN-8921</strong> • Munich Central Tower
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Enrolled
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Hardware 2FA Key (YubiKey 5C)
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        FIDO2 WebAuthn • Tag 6APX-SEC-9122
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                      Synced
                    </span>
                  </div>
                </div>
              </div>

              {/* Developer Systems & Cloud Environments */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Terminal size={17} className="text-teal-600" />
                  <span>Cloud Systems &amp; Repositories</span>
                </h3>

                <div className="space-y-2.5 pt-1">
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        GitLab Enterprise Workspace
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Role: Maintainer • SSH Key Registered
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Authorized
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        PostgreSQL Odoo 14 Database
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        aryanodoo on localhost:5432 • Port 8069
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Live Daemon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

