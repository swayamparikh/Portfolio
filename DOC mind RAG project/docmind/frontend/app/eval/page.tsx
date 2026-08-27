"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { api, type EvalRun } from "@/lib/api";
import { EvalTrendChart } from "@/components/charts/EvalTrendChart";

function StatTile({ label, value, prevValue }: { label: string; value: number | null; prevValue?: number | null }) {
  const pct = value !== null ? Math.round(value * 100) : null;
  const prevPct = prevValue !== null && prevValue !== undefined ? Math.round(prevValue * 100) : null;
  const trend = pct !== null && prevPct !== null ? pct - prevPct : null;

  return (
    <div className="rounded-instrument border border-[#262626] bg-[#111111] p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-gray-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-white">{pct !== null ? `${pct}%` : "—"}</span>
        {trend !== null && trend !== 0 && (
          <span className={clsx("font-mono text-xs", trend > 0 ? "text-signal" : "text-gray-400")}>
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function EvalDashboardPage() {
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [latestDetail, setLatestDetail] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chunkSize, setChunkSize] = useState(800);
  const [topK, setTopK] = useState(5);
  const [temperature, setTemperature] = useState(0.2);

  const refresh = useCallback(async () => {
    const data = await api.listEvalRuns();
    setRuns(data);
    if (data.length > 0) {
      const detail = await api.getEvalRun(data[0].id);
      setLatestDetail(detail);
      setChunkSize(detail.chunk_size);
      setTopK(detail.top_k);
      setTemperature(detail.temperature);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRun() {
    setRunning(true);
    setError(null);
    try {
      await api.runEval({ chunkSize, topK, temperature });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation run failed");
    } finally {
      setRunning(false);
    }
  }

  const latest = runs[0];
  const prev = runs[1];

  return (
    <div className="min-h-screen bg-console-bg px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-mono text-2xl font-bold tracking-tight">Evaluation Console</h1>
          <button
            onClick={handleRun}
            disabled={running}
            className={clsx(
              "rounded-instrument border border-white px-4 py-2 font-mono text-sm transition-all disabled:opacity-50",
              running ? "shadow-[0_0_16px_rgba(225,6,0,0.5)] border-signal text-signal" : "hover:bg-white hover:text-black"
            )}
          >
            {running ? "Running Evaluation..." : "Run Evaluation"}
          </button>
        </div>

        {error && <p className="mb-4 font-mono text-sm text-signal">{error}</p>}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Faithfulness" value={latest?.overall_faithfulness ?? null} prevValue={prev?.overall_faithfulness} />
          <StatTile label="Relevance" value={latest?.overall_relevance ?? null} prevValue={prev?.overall_relevance} />
          <StatTile
            label="Retrieval Accuracy"
            value={latest?.overall_retrieval_accuracy ?? null}
            prevValue={prev?.overall_retrieval_accuracy}
          />
        </div>

        <div className="mb-6 rounded-instrument border border-[#262626] bg-[#111111] p-5">
          {runs.length > 0 ? (
            <EvalTrendChart runs={runs} />
          ) : (
            <p className="py-16 text-center font-mono text-sm text-gray-500">
              No eval runs yet. Add eval questions and click "Run Evaluation".
            </p>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
          <div className="rounded-instrument border border-[#262626] bg-[#111111] p-5">
            <h2 className="mb-3 font-mono text-sm font-semibold">Test Questions</h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#262626] text-left text-gray-400">
                    <th className="py-2 pr-4">Question</th>
                    <th className="py-2 pr-4">Answer Summary</th>
                    <th className="py-2 pr-4">Retrieval</th>
                    <th className="py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {latestDetail?.results?.map((r: any) => (
                    <tr key={r.id} className="border-b border-[#1a1a1a]">
                      <td className="max-w-[200px] truncate py-2 pr-4">{r.question}</td>
                      <td className="max-w-[280px] truncate py-2 pr-4 text-gray-400">{r.actual_answer}</td>
                      <td className="py-2 pr-4">{r.retrieval_hit ? "hit" : "miss"}</td>
                      <td className={clsx("py-2 font-semibold", r.passed ? "text-white" : "text-signal")}>
                        {r.passed ? "PASS" : "FAIL"}
                      </td>
                    </tr>
                  ))}
                  {(!latestDetail || latestDetail.results.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        No results yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-instrument border border-[#262626] bg-[#111111] p-5">
            <h2 className="mb-3 font-mono text-sm font-semibold">Settings</h2>
            <div className="flex flex-col gap-4 font-mono text-xs">
              <label className="flex flex-col gap-1">
                Chunk size: {chunkSize}
                <input
                  type="range"
                  min={200}
                  max={2000}
                  step={50}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Top-K: {topK}
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value))}
                />
              </label>
              <label className="flex flex-col gap-1">
                Temperature: {temperature.toFixed(2)}
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </label>
              <button
                onClick={handleRun}
                disabled={running}
                className="mt-2 rounded-instrument border border-white py-2 hover:bg-white hover:text-black disabled:opacity-50"
              >
                Re-run with these settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
