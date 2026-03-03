import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { SUBJECT_CHAPTERS } from '../data/subjectData';
import { HelpCircle, Sparkles } from 'lucide-react';

// ── Pure-SVG Radar Chart ──────────────────────────────────────────────────────

function RadarChart({ axes, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r  = size * 0.38;
  const levels = 5;
  const n = axes.length;

  // Angle for each axis (starting top, clockwise)
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  // Point on the grid at a given level fraction and axis
  const gridPoint = (i, frac) => ({
    x: cx + r * frac * Math.cos(angle(i)),
    y: cy + r * frac * Math.sin(angle(i)),
  });

  // Build polygon string for a data series
  const polyPoints = (values) =>
    values.map((v, i) => {
      const pt = gridPoint(i, v / 100);
      return `${pt.x},${pt.y}`;
    }).join(' ');

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => (i + 1) / levels);

  const [hoveredAxis, setHoveredAxis] = useState(null);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.20" />
        </linearGradient>
        <linearGradient id="radarFillWeak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((frac, ri) => {
        const pts = Array.from({ length: n }, (_, i) => gridPoint(i, frac));
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return (
          <path
            key={ri}
            d={d}
            fill="none"
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray={ri === rings.length - 1 ? 'none' : '3,3'}
          />
        );
      })}

      {/* Axis spokes */}
      {axes.map((_, i) => {
        const outer = gridPoint(i, 1);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke="#1e293b"
            strokeWidth={1}
          />
        );
      })}

      {/* Ideal (100%) polygon — faint */}
      <polygon
        points={polyPoints(axes.map(() => 100))}
        fill="none"
        stroke="#334155"
        strokeWidth={1}
        strokeDasharray="4,4"
      />

      {/* Actual data polygon */}
      <polygon
        points={polyPoints(axes.map(a => a.value))}
        fill="url(#radarFill)"
        stroke="#6366f1"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data points */}
      {axes.map((a, i) => {
        const pt = gridPoint(i, a.value / 100);
        const isWeak = a.value < 50;
        const isHovered = hoveredAxis === i;
        return (
          <g key={i}>
            <circle
              cx={pt.x} cy={pt.y} r={isHovered ? 6 : 4}
              fill={isWeak ? '#ef4444' : '#6366f1'}
              stroke={isWeak ? '#fca5a5' : '#a5b4fc'}
              strokeWidth={1.5}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredAxis(i)}
              onMouseLeave={() => setHoveredAxis(null)}
            />
            {isHovered && (
              <text
                x={pt.x}
                y={pt.y - 10}
                textAnchor="middle"
                fill="#c7d2fe"
                fontSize="9"
                fontWeight="600"
                fontFamily="monospace"
              >
                {a.value}%
              </text>
            )}
          </g>
        );
      })}

      {/* Axis labels */}
      {axes.map((a, i) => {
        const labelR = r + 20;
        const lx = cx + labelR * Math.cos(angle(i));
        const ly = cy + labelR * Math.sin(angle(i));
        const isWeak = a.value < 50;
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isWeak ? '#f87171' : '#94a3b8'}
            fontSize="9"
            fontFamily="monospace"
            fontWeight={isWeak ? '700' : '400'}
          >
            {a.label}
          </text>
        );
      })}

      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={2} fill="#475569" />
    </svg>
  );
}

// ── Knowledge Radar Panel ────────────────────────────────────────────────────

export default function KnowledgeRadar({ subjectCode, liveChapters = null }) {
  // Use live chapters (with API scores) if available, otherwise fall back to static data
  const chapters = liveChapters || SUBJECT_CHAPTERS[subjectCode] || [];
  const isLive = liveChapters !== null;

  const axes = chapters.map(ch => ({
    label: ch.num.replace('CH ', 'CH'),
    fullLabel: ch.title,
    value: ch.stability,
    status: ch.status,
    color: ch.barColor,
  }));

  const weakAxes = axes.filter(a => a.value < 50);
  const strongAxes = axes.filter(a => a.value >= 75);

  return (
    <div className="rounded-xl p-5 flex flex-col gap-4 bg-slate-900/70 backdrop-blur-sm border border-indigo-500/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles size={14} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">Knowledge Radar</h3>
          </div>
          <p className="text-xs text-slate-500">Stability across all chapters</p>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              live PDF data
            </span>
          )}
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-600">
            <HelpCircle size={11} />
            <span>Hover points</span>
          </div>
        </div>
      </div>

      {/* Chart + legend */}
      <div className="flex flex-col items-center gap-4">
        <RadarChart axes={axes} size={210} />

        {/* Chapter legend */}
        <div className="w-full grid grid-cols-2 gap-1.5">
          {axes.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: a.value < 50 ? '#ef4444' : a.color }}
              />
              <span className="text-[10px] font-mono text-slate-500 truncate">
                {a.label}: <span className={cn(
                  'font-semibold',
                  a.value < 50 ? 'text-red-400' : a.value >= 75 ? 'text-emerald-400' : 'text-amber-400'
                )}>{a.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight pills */}
      {weakAxes.length > 0 && (
        <div className="p-3 rounded-lg bg-red-500/8 border border-red-500/20">
          <p className="text-[10px] font-mono text-red-400 font-semibold mb-1 uppercase tracking-wider">⚠ Critical Gaps</p>
          <p className="text-xs text-slate-400">
            {weakAxes.map(a => `${a.label} (${a.value}%)`).join(', ')} — below 50% threshold
          </p>
        </div>
      )}
      {strongAxes.length > 0 && (
        <div className="p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
          <p className="text-[10px] font-mono text-emerald-400 font-semibold mb-1 uppercase tracking-wider">✓ Strong Areas</p>
          <p className="text-xs text-slate-400">
            {strongAxes.map(a => `${a.label} (${a.value}%)`).join(', ')} — well consolidated
          </p>
        </div>
      )}
    </div>
  );
}
