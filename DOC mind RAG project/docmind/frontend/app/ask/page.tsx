"use client";

import { useState } from "react";
import { api, type AnswerResult } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { CitationChip } from "@/components/ui/CitationChip";
import { ScanLine } from "@/components/ui/ScanLine";

interface Turn {
  question: string;
  answer?: AnswerResult;
  error?: string;
}

const SUGGESTED = [
  "What is this document about?",
  "Summarize the key numbers in the uploaded files.",
  "Who are the parties mentioned?",
];

export default function AskPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || thinking) return;
    setInput("");
    setThinking(true);
    setTurns((t) => [...t, { question }]);
    try {
      const answer = await api.askQuestion(question);
      setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? { ...turn, answer } : turn)));
    } catch (err) {
      setTurns((t) =>
        t.map((turn, i) => (i === t.length - 1 ? { ...turn, error: err instanceof Error ? err.message : "Failed" } : turn))
      );
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-6 py-8">
      <h1 className="mb-4 font-heading text-2xl font-bold text-graphite">Ask</h1>

      {turns.length === 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="rounded-full border border-hairline px-3 py-1.5 font-mono text-xs text-muted hover:border-signal hover:text-signal"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {turns.map((turn, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="ml-auto max-w-[80%] rounded-instrument bg-graphite px-4 py-2 text-sm text-white">
              {turn.question}
            </div>

            {turn.error && (
              <Card className="max-w-[85%] p-4 text-sm text-signal">{turn.error}</Card>
            )}

            {!turn.answer && !turn.error && (
              <Card className="max-w-[85%] p-4">
                <ScanLine />
                <p className="mt-2 font-mono text-xs text-muted">Retrieving + generating...</p>
              </Card>
            )}

            {turn.answer && (
              <Card className="max-w-[85%] p-4">
                <div className="mb-2 flex justify-end">
                  <ConfidenceBadge confidence={turn.answer.confidence} />
                </div>
                <p className="whitespace-pre-wrap text-sm text-graphite">{turn.answer.answer}</p>
                {turn.answer.citations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {turn.answer.citations.map((c, ci) => (
                      <CitationChip key={ci} citation={c} />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex gap-2 border-t border-hairline pt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 rounded-instrument border border-hairline px-4 py-2 text-sm outline-none focus:border-signal"
        />
        <Button type="submit" variant="primary" disabled={thinking}>
          Ask
        </Button>
      </form>
    </div>
  );
}
