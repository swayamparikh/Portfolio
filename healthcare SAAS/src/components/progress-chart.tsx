"use client";

import { useMemo, useState } from "react";

export type Series = {
  label: string;
  unit: string;
  points: { date: string; value: number }[];
};

const COLORS = ["#22d3ee", "#818cf8", "#a855f7", "#34d399", "#fbbf24", "#fb7185"];

/**
 * Outcome trend across the episode of care. Hand-drawn SVG so the whole chart
 * ships in a couple of KB rather than pulling a charting library.
 */
export function ProgressChart({ series }: { series: Series[] }) {
  const [active, setActive] = useState<Set<string>>(
    () => new Set(series.map((s) => s.label)),
  );
  const [hover, setHover] = useState<number | null>(null);

  const shown = series.filter((s) => active.has(s.label));

  const { dates, scaled, min, max } = useMemo(() => {
    const dateSet = new Set<string>();
    series.forEach((s) => s.points.forEach((p) => dateSet.add(p.date)));
    const dates = [...dateSet].sort();

    const values = shown.flatMap((s) => s.points.map((p) => p.value));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 10;
    const pad = (max - min) * 0.15 || 1;
    const lo = Math.max(0, min - pad);
    const hi = max + pad;

    const scaled = shown.map((s, i) => ({
      ...s,
      color: COLORS[series.findIndex((x) => x.label === s.label) % COLORS.length],
      coords: s.points.map((p) => ({
        x: dates.length > 1 ? (dates.indexOf(p.date) / (dates.length - 1)) * 100 : 50,
        y: 100 - ((p.value - lo) / (hi - lo || 1)) * 100,
        value: p.value,
        date: p.date,
      })),
      _i: i,
    }));

    return { dates, scaled, min: lo, max: hi };
  }, [series, shown]);

  if (series.length === 0 || dates.length === 0) {
    return (
      <div className="glass p-10 text-center text-sm text-muted">
        No outcome measures recorded yet. Log a visit with a pain score or ROM value and the
        trend appears here.
      </div>
    );
  }

  function toggle(label: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(label) && next.size > 1) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <div className="glass p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted">
          Outcome trend
        </h3>
        <div className="flex flex-wrap gap-2">
          {series.map((s, i) => {
            const on = active.has(s.label);
            const color = COLORS[i % COLORS.length];
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => toggle(s.label)}
                className={`chip transition ${on ? "" : "opacity-40"}`}
                style={on ? { borderColor: `${color}66`, color } : undefined}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: color }}
                  aria-hidden
                />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-56 w-full overflow-visible"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            {scaled.map((s) => (
              <linearGradient key={s.label} id={`fill-${s._i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="0.3"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {scaled.map((s) => {
            if (s.coords.length === 0) return null;
            const line = s.coords.map((c, i) => `${i ? "L" : "M"}${c.x},${c.y}`).join(" ");
            const area = `${line} L${s.coords[s.coords.length - 1].x},100 L${s.coords[0].x},100 Z`;
            return (
              <g key={s.label}>
                <path d={area} fill={`url(#fill-${s._i})`} />
                <path
                  d={line}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {s.coords.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={hover === i ? 4 : 2.5}
                    fill="#04060d"
                    stroke={s.color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: "r 0.15s" }}
                  />
                ))}
              </g>
            );
          })}

          {dates.map((_, i) => (
            <rect
              key={i}
              x={(i / Math.max(1, dates.length - 1)) * 100 - 50 / Math.max(1, dates.length)}
              y="0"
              width={100 / Math.max(1, dates.length)}
              height="100"
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute -left-1 top-0 flex h-56 flex-col justify-between text-[10px] text-muted">
          <span>{max.toFixed(0)}</span>
          <span>{min.toFixed(0)}</span>
        </div>
      </div>

      <div className="mt-3 flex justify-between text-[10px] text-muted">
        <span>{new Date(dates[0]).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        {hover !== null && dates[hover] && (
          <span className="font-semibold text-cyan-300">
            {new Date(dates[hover]).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            {shown
              .map((s) => {
                const pt = s.points.find((p) => p.date === dates[hover]);
                return pt ? ` · ${s.label} ${pt.value}${s.unit}` : "";
              })
              .join("")}
          </span>
        )}
        <span>
          {new Date(dates[dates.length - 1]).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
