"use client";

import { useMemo, useState } from "react";

interface TrendPoint {
  day: string;
  count: number;
  total: number;
}

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 48;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const LINE_COLOR = "#4f46e5"; // brand-600, validated against light surface

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const maxTotal = useMemo(() => niceMax(Math.max(...data.map((d) => d.total), 0)), [data]);

  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No revenue in this period yet.</p>;
  }

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = data.length === 1 ? PAD_LEFT : PAD_LEFT + (i / (data.length - 1)) * plotWidth;
    const y = PAD_TOP + plotHeight - (d.total / maxTotal) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD_TOP + plotHeight).toFixed(1)} Z`;

  const yTicks = [0, 0.5, 1].map((f) => Math.round(maxTotal * f));

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const ratio = data.length === 1 ? 0 : Math.min(Math.max((relX - PAD_LEFT) / plotWidth, 0), 1);
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(index);
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-slate-500">Revenue by day</p>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-xs text-brand-600 underline hover:text-brand-700"
        >
          {showTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-56 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="py-1.5">Day</th>
                <th className="py-1.5">Orders</th>
                <th className="py-1.5">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-b border-slate-100 last:border-0">
                  <td className="py-1.5 text-slate-600">{d.day}</td>
                  <td className="py-1.5 text-slate-600">{d.count}</td>
                  <td className="py-1.5 text-slate-900">₹{d.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Revenue trend by day">
          {yTicks.map((tick) => {
            const y = PAD_TOP + plotHeight - (tick / maxTotal) * plotHeight;
            return (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  x2={WIDTH - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
                <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize={10} fill="#94a3b8">
                  ₹{tick >= 1000 ? `${(tick / 1000).toFixed(1)}K` : tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={LINE_COLOR} fillOpacity={0.1} stroke="none" />
          <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              fill={LINE_COLOR}
              stroke="#ffffff"
              strokeWidth={2}
            />
          )}

          {hovered && (
            <>
              <line
                x1={hovered.x}
                x2={hovered.x}
                y1={PAD_TOP}
                y2={PAD_TOP + plotHeight}
                stroke="#cbd5e1"
                strokeWidth={1}
              />
              <circle cx={hovered.x} cy={hovered.y} r={4} fill={LINE_COLOR} stroke="#ffffff" strokeWidth={2} />
            </>
          )}

          <rect
            x={PAD_LEFT}
            y={PAD_TOP}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>
      )}

      {hovered && !showTable && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: LINE_COLOR }} />
          <span className="font-medium text-slate-900">₹{hovered.total.toFixed(2)}</span>
          <span className="text-slate-500">
            · {hovered.count} order{hovered.count === 1 ? "" : "s"} · {hovered.day}
          </span>
        </div>
      )}
    </div>
  );
}
