"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChartRow {
  date: string;
  sent: number;
  replies: number;
  bounces: number;
  meetings: number;
}

export function KpiCharts({ data }: { data: ChartRow[] }) {
  if (data.length === 0) {
    return <p className="text-sm opacity-50">No daily stats yet — the check-bounces/send-sequences crons populate this.</p>;
  }

  return (
    <div className="h-80 w-full rounded border border-black/10 p-4 dark:border-white/10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sent" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="replies" stroke="#16a34a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="bounces" stroke="#dc2626" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="meetings" stroke="#9333ea" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
