"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function PlatformChart({ data }: { data: { platform: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="platform"
          tickLine={false}
          axisLine={false}
          className="text-xs"
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          className="text-xs"
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--popover-foreground)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
