// src/components/MetricCard.jsx
import React from 'react';
import * as LucideIcons from 'lucide-react';

const COLOR_MAP = {
  indigo: {
    tile: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    trend: "text-indigo-700 bg-indigo-50 border-indigo-200",
    stroke: "#6366F1",
    fill: "rgba(99, 102, 241, 0.15)",
  },
  emerald: {
    tile: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    trend: "text-emerald-700 bg-emerald-50 border-emerald-200",
    stroke: "#10B981",
    fill: "rgba(16, 185, 129, 0.15)",
  },
  purple: {
    tile: "bg-purple-50 text-purple-600 border border-purple-100",
    trend: "text-purple-700 bg-purple-50 border-purple-200",
    stroke: "#8B5CF6",
    fill: "rgba(139, 92, 246, 0.15)",
  },
  sky: {
    tile: "bg-sky-50 text-sky-600 border border-sky-100",
    trend: "text-sky-700 bg-sky-50 border-sky-200",
    stroke: "#0EA5E9",
    fill: "rgba(14, 165, 233, 0.15)",
  },
  amber: {
    tile: "bg-amber-50 text-amber-600 border border-amber-100",
    trend: "text-amber-800 bg-amber-50 border-amber-200",
    stroke: "#F59E0B",
    fill: "rgba(245, 158, 11, 0.15)",
  },
  rose: {
    tile: "bg-rose-50 text-rose-600 border border-rose-100",
    trend: "text-rose-700 bg-rose-50 border-rose-200",
    stroke: "#F43F5E",
    fill: "rgba(244, 63, 94, 0.15)",
  },
  teal: {
    tile: "bg-teal-50 text-teal-600 border border-teal-100",
    trend: "text-teal-700 bg-teal-50 border-teal-200",
    stroke: "#14B8A6",
    fill: "rgba(20, 184, 166, 0.15)",
  },
  blue: {
    tile: "bg-blue-50 text-blue-600 border border-blue-100",
    trend: "text-blue-700 bg-blue-50 border-blue-200",
    stroke: "#2563EB",
    fill: "rgba(37, 99, 235, 0.15)",
  },
  pink: {
    tile: "bg-pink-50 text-pink-600 border border-pink-100",
    trend: "text-pink-700 bg-pink-50 border-pink-200",
    stroke: "#EC4899",
    fill: "rgba(236, 72, 153, 0.15)",
  }
};

export default function MetricCard({ metric }) {
  const {
    label,
    value,
    sub,
    trend,
    trendDirection = "up",
    color = "indigo",
    icon = "Layers",
    sparkline = [10, 20, 15, 30, 25, 35, 40]
  } = metric;

  const style = COLOR_MAP[color] || COLOR_MAP.indigo;
  const IconComponent = LucideIcons[icon] || LucideIcons.BarChart2;

  // Compute SVG sparkline path
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group">
      
      {/* Top Header: Title & Icon Box */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${style.tile}`}>
          <IconComponent size={18} strokeWidth={2.2} />
        </div>
      </div>

      {/* Metric Main Value + Sparkline */}
      <div className="flex items-baseline justify-between gap-3 my-2.5">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          {value}
        </div>

        {/* Sparkline Vector */}
        <div className="shrink-0 pt-1">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke={style.stroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      {/* Footer: Trend Badge & Subtitle Context */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
        <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
          {sub}
        </span>
        {trend && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${style.trend}`}>
            {trendDirection === "up" && "↑ "}
            {trendDirection === "down" && "↓ "}
            {trend}
          </span>
        )}
      </div>

    </div>
  );
}
