// src/components/DashboardCharts.jsx
import React, { useState } from 'react';

// ============================================================================
// 1. SMOOTH AREA TREND CHART
// ============================================================================
export function AreaChartCard({ chart }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const { title, subtitle, data = [], series = [] } = chart;

  if (!data || data.length === 0) return null;

  const svgWidth = 460;
  const svgHeight = 180;
  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  let maxVal = 0;
  data.forEach(d => {
    series.forEach(s => {
      if (d[s.key] > maxVal) maxVal = d[s.key];
    });
  });
  maxVal = Math.ceil(maxVal * 1.1) || 10;

  const yTicks = [0, Math.round(maxVal * 0.5), maxVal];

  const getCoordinates = (seriesKey) => {
    return data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((d[seriesKey] || 0) / maxVal) * chartH;
      return { x, y, val: d[seriesKey], label: d.label };
    });
  };

  return (
    <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-2.5 text-[11px]">
          {series.map(s => (
            <div key={s.key} className="flex items-center space-x-1 font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-40 select-none overflow-visible">
          <defs>
            {series.map(s => (
              <linearGradient key={`g-${s.key}`} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {yTicks.map((tick, idx) => {
            const y = padding.top + chartH - (tick / maxVal) * chartH;
            return (
              <g key={idx}>
                <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padding.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="600">{tick}</text>
              </g>
            );
          })}

          {series.map(s => {
            const coords = getCoordinates(s.key);
            const linePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
            const areaPoints = `${coords[0].x},${padding.top + chartH} ${linePoints} ${coords[coords.length - 1].x},${padding.top + chartH}`;

            return (
              <g key={s.key}>
                <polygon points={areaPoints} fill={`url(#g-${s.key})`} />
                <polyline fill="none" stroke={s.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={linePoints} />
                {coords.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={hoverIndex === i ? "4.5" : "3"}
                    fill="#FFFFFF"
                    stroke={s.color}
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  />
                ))}
              </g>
            );
          })}

          {data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartW;
            return (
              <text key={i} x={x} y={svgHeight - 8} textAnchor="middle" fontSize="9" fill={hoverIndex === i ? "#0F172A" : "#64748B"} fontWeight={hoverIndex === i ? "700" : "500"}>
                {d.label}
              </text>
            );
          })}
        </svg>

        {hoverIndex !== null && data[hoverIndex] && (
          <div className="absolute top-1 right-2 bg-slate-900/90 text-white text-[10px] px-2.5 py-1 rounded-lg pointer-events-none shadow-md z-10">
            <span className="font-bold text-slate-300">{data[hoverIndex].label}: </span>
            {series.map(s => (
              <span key={s.key} className="ml-1 font-bold" style={{ color: s.color }}>
                {s.name} {data[hoverIndex][s.key]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 2. MODERN DONUT / RING BREAKDOWN CHART
// ============================================================================
export function DonutChartCard({ chart }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const { title, subtitle, data = [], centerText, centerLabel = "Total" } = chart;

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const radius = 54;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = 0;

  return (
    <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center justify-between gap-4 my-auto py-2">
        {/* Vector SVG Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} />
            {data.map((item, idx) => {
              const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeAngle;
              cumulativeAngle += (item.value / total) * circumference;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center text badge */}
          <div className="absolute text-center">
            <span className="text-base font-extrabold text-slate-900 font-mono block leading-none">
              {hoveredIdx !== null ? data[hoveredIdx].value : (centerText || total)}
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5 block">
              {hoveredIdx !== null ? data[hoveredIdx].label : centerLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5 text-xs">
          {data.map((item, idx) => {
            const pct = Math.round((item.value / total) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? "bg-slate-50 font-bold" : "text-slate-600"
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate text-[11px]">{item.label}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-900 shrink-0 ml-2">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Breakdown</span>
        <span>Relative Proportions</span>
      </div>
    </div>
  );
}

// ============================================================================
// 3. CLEAN HORIZONTAL BAR CHART
// ============================================================================
export function BarChartCard({ chart }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const { title, subtitle, data = [] } = chart;

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="space-y-2.5 my-auto py-1">
        {data.map((item, idx) => {
          const percentage = Math.round((item.count / maxVal) * 100);
          const isHovered = hoverIndex === idx;

          return (
            <div
              key={idx}
              className="space-y-1 cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={isHovered ? "text-slate-900 font-bold" : "text-slate-700"}>
                  {item.label}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {item.count}
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color || "#6366F1",
                    opacity: isHovered ? 1 : 0.88
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Metric Scale</span>
        <span>Count</span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: DISPATCHER FOR 2 CLEAN, DIVERSE CHARTS
// ============================================================================
export default function DashboardCharts({ charts = [] }) {
  if (!charts || charts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((c, idx) => {
        if (c.type === "donut") {
          return <DonutChartCard key={idx} chart={c} />;
        }
        if (c.type === "bar") {
          return <BarChartCard key={idx} chart={c} />;
        }
        return <AreaChartCard key={idx} chart={c} />;
      })}
    </div>
  );
}
