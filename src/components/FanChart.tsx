import { motion } from "motion/react";
import type { Projection } from "../lib/plan";
import { compactRupees } from "../lib/format";

export function FanChart({ projection, target, color = "var(--mint)", height = 150 }: { projection: Projection; target?: number; color?: string; height?: number }) {
  const width = 320;
  const pad = { top: 16, bottom: 18 };
  const { points } = projection;
  const max = Math.max(projection.high, target ?? 0) * 1.05 || 1;
  const x = (index: number) => (index / Math.max(1, points.length - 1)) * width;
  const y = (value: number) => pad.top + (1 - value / max) * (height - pad.top - pad.bottom);
  const line = (key: "low" | "typical" | "high") => points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point[key]).toFixed(1)}`).join(" ");
  const band =
    points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${y(point.high).toFixed(1)}`).join(" ") +
    " " +
    [...points].reverse().map((point, index) => `L${x(points.length - 1 - index).toFixed(1)},${y(point.low).toFixed(1)}`).join(" ") +
    " Z";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Projection range: likely, good case and tough case">
      {target !== undefined && (
        <g>
          <line x1={0} x2={width} y1={y(target)} y2={y(target)} stroke="var(--ink-3)" strokeDasharray="4 4" strokeWidth={1} />
          <text x={4} y={y(target) - 5} fontSize={10} fill="var(--ink-2)" fontWeight={600}>
            Goal {compactRupees(target)}
          </text>
        </g>
      )}
      <motion.path d={band} fill={color} fillOpacity={0.14} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
      <path d={line("high")} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={1.5} />
      <path d={line("low")} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={1.5} />
      <motion.path
        d={line("typical")}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </svg>
  );
}
