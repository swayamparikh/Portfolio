"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { EvalRun } from "@/lib/api";

export function EvalTrendChart({ runs }: { runs: EvalRun[] }) {
  const data = [...runs]
    .reverse()
    .map((r) => ({
      run: new Date(r.run_at).toLocaleTimeString(),
      faithfulness: r.overall_faithfulness,
      relevance: r.overall_relevance,
      retrieval: r.overall_retrieval_accuracy,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
        <XAxis dataKey="run" stroke="#9CA3AF" fontSize={11} />
        <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 1]} />
        <Tooltip
          contentStyle={{ background: "#111111", border: "1px solid #262626", fontFamily: "monospace", fontSize: 12 }}
          labelStyle={{ color: "#fff" }}
        />
        <Line type="monotone" dataKey="faithfulness" stroke="#E10600" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="relevance" stroke="#FFFFFF" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="retrieval" stroke="#9CA3AF" strokeWidth={2} dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
