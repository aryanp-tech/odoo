// src/components/FigmaExportModal.jsx
import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Palette, Download, Sparkles } from 'lucide-react';
import { ROLES_CONFIG } from '../data/rolesData';

export default function FigmaExportModal({ isOpen, onClose, currentRoleKey }) {
  if (!isOpen) return null;

  const [copiedTab, setCopiedTab] = useState(null);
  const [activeTab, setActiveTab] = useState('svg');
  const role = ROLES_CONFIG[currentRoleKey] || ROLES_CONFIG.employee;

  // Generate clean SVG Artboard of the current role dashboard that can be pasted directly into Figma!
  const generateFigmaSVG = () => {
    return `<!-- FIGMA COMPATIBLE VECTOR ARTBOARD: ${role.name.toUpperCase()} DASHBOARD -->
<svg width="1440" height="960" viewBox="0 0 1440 960" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Canvas -->
  <rect width="1440" height="960" fill="#F8FAFC"/>
  
  <!-- Top Navigation Header -->
  <rect width="1440" height="56" fill="#FFFFFF"/>
  <line x1="0" y1="56" x2="1440" y2="56" stroke="#E2E8F0" stroke-width="1"/>
  
  <!-- Brand Logo Badge -->
  <rect x="24" y="12" width="32" height="32" rx="8" fill="#714B67"/>
  <text x="33" y="33" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800">LT</text>
  <text x="68" y="28" fill="#0F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="800">SquadFocus</text>
  <text x="68" y="42" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="600">Enterprise Edition</text>
  
  <!-- Role Banner Frame -->
  <rect x="24" y="80" width="1392" height="72" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
  <rect x="24" y="80" width="6" height="72" rx="3" fill="${role.accentHex}"/>
  <text x="48" y="112" fill="#0F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="800">${role.name} — Dashboard Console</text>
  <text x="48" y="134" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="500">${role.subtitle}</text>
  
  <!-- KPI Metric Cards (Row of 4) -->
  ${role.metrics.map((m, i) => {
    const x = 24 + i * 354;
    return `
    <g transform="translate(${x}, 172)">
      <rect width="338" height="136" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="32" fill="#64748B" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">${m.label.toUpperCase()}</text>
      <rect x="278" y="16" width="40" height="40" rx="12" fill="#F1F5F9"/>
      <text x="20" y="78" fill="#0F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="28" font-weight="800">${m.value}</text>
      <line x1="20" y1="98" x2="318" y2="98" stroke="#F1F5F9" stroke-width="1"/>
      <text x="20" y="118" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="500">${m.sub}</text>
      <rect x="260" y="106" width="58" height="18" rx="9" fill="#ECFDF5"/>
      <text x="268" y="119" fill="#047857" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700">${m.trend}</text>
    </g>`;
  }).join('')}

  <!-- Chart Left Frame -->
  <g transform="translate(24, 328)">
    <rect width="684" height="280" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <text x="24" y="36" fill="#0F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700">${role.charts[0]?.title || 'Trend Chart'}</text>
    <text x="24" y="54" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="500">${role.charts[0]?.subtitle || ''}</text>
    <rect x="24" y="72" width="636" height="184" rx="10" fill="#F8FAFC"/>
  </g>

  <!-- Chart Right Frame -->
  <g transform="translate(732, 328)">
    <rect width="684" height="280" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
    <text x="24" y="36" fill="#0F172A" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700">${role.charts[1]?.title || 'Distribution Chart'}</text>
    <text x="24" y="54" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="500">${role.charts[1]?.subtitle || ''}</text>
    <rect x="24" y="72" width="636" height="184" rx="10" fill="#F8FAFC"/>
  </g>
</svg>`;
  };

  const figmaDesignTokens = {
    colorPalette: {
      brand: {
        odooPurple: "#714B67",
        indigoAccent: "#6366F1",
        slateBackground: "#F8FAFC",
        cardWhite: "#FFFFFF",
        subtleBorder: "#E2E8F0"
      },
      statusPills: {
        emeraldSuccess: "#10B981",
        amberPending: "#F59E0B",
        skyActive: "#0EA5E9",
        roseDanger: "#F43F5E",
        purpleReview: "#8B5CF6"
      }
    },
    typography: {
      fontFamily: "Plus Jakarta Sans / Onest, sans-serif",
      scales: {
        h1: "28px / 800 bold",
        h2: "20px / 700 bold",
        h3: "14px / 700 bold",
        body: "13px / 500 regular",
        badge: "10px / 700 bold uppercase"
      }
    },
    components: [
      "MetricCard (Rounded 16px, White base, 1px border #E2E8F0, soft elevation)",
      "AttendancePunchWidget (Live stopwatch, geo-tag, status badge, progress bar)",
      "QuickActionGrid (Colorful pixel background tiles, 12px font, micro-interaction)",
      "AnnouncementBanner (Gradient fill #F8FAFC to #EDE9FE, category badge, action button)"
    ]
  };

  const handleCopy = (text, tab) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#714B67] flex items-center justify-center font-bold">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Figma File & Design System Assets
              </h2>
              <p className="text-xs text-slate-500">
                Directly importable into Figma with 1-click clipboard paste
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 px-5 pt-3 gap-3 bg-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('svg')}
            className={`pb-2.5 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'svg'
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCode size={14} />
            <span>Figma SVG Artboard</span>
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`pb-2.5 border-b-2 transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'tokens'
                ? "border-[#714B67] text-[#714B67]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Palette size={14} />
            <span>Design Tokens JSON</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          
          <div className="bg-purple-50/80 border border-purple-200 p-3.5 rounded-xl text-purple-950 flex items-start space-x-2.5">
            <Sparkles size={16} className="text-[#714B67] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">How to import into Figma:</span> Click the copy button below, open your Figma canvas, and press <kbd className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-purple-200 text-purple-900">Ctrl+V</kbd> (or <kbd className="bg-white px-1.5 py-0.5 rounded font-mono font-bold border border-purple-200 text-purple-900">Cmd+V</kbd>). Figma automatically translates the SVG into editable layers, shapes, texts, and auto-layouts!
            </div>
          </div>

          {activeTab === 'svg' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">
                  Vector Artboard for: <span className="text-[#714B67]">{role.name}</span>
                </span>
                <button
                  onClick={() => handleCopy(generateFigmaSVG(), 'svg')}
                  className="px-3 py-1.5 bg-[#714B67] hover:bg-[#583850] text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                >
                  {copiedTab === 'svg' ? (
                    <>
                      <Check size={13} />
                      <span>Copied for Figma!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy SVG to Clipboard</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                value={generateFigmaSVG()}
                rows={10}
                className="w-full font-mono text-[11px] p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 outline-none select-all"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700">Design System Tokens</span>
                <button
                  onClick={() => handleCopy(JSON.stringify(figmaDesignTokens, null, 2), 'tokens')}
                  className="px-3 py-1.5 bg-[#714B67] hover:bg-[#583850] text-white rounded-lg font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
                >
                  {copiedTab === 'tokens' ? (
                    <>
                      <Check size={13} />
                      <span>Tokens Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Tokens JSON</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                value={JSON.stringify(figmaDesignTokens, null, 2)}
                rows={10}
                className="w-full font-mono text-[11px] p-3 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 outline-none select-all"
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">9 Individual Role Dashboards Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
