"use client";

import { useState } from "react";
import type { Citation } from "@/lib/api";

export function CitationChip({ citation, filename }: { citation: Citation; filename?: string }) {
  const [open, setOpen] = useState(false);
  const label = filename ? `${filename}${citation.page ? ` · p.${citation.page}` : ""}` : citation.documentId;

  return (
    <div className="inline-block align-top">
      <button
        onClick={() => setOpen((o) => !o)}
        className="animate-pulse-red rounded-full border border-signal bg-white px-2.5 py-1 font-mono text-[11px] text-signal transition-all hover:shadow-red-glow"
        style={{ animationIterationCount: 1 }}
      >
        [{label}]
      </button>
      {open && (
        <div className="mt-2 max-w-md rounded-instrument border border-hairline bg-white p-3 font-mono text-xs leading-relaxed text-graphite shadow-sm">
          <span className="bg-signal/10 px-0.5">{citation.snippet}</span>
        </div>
      )}
    </div>
  );
}
