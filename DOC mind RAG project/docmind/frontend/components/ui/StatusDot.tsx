import clsx from "clsx";
import type { DocMindDocument } from "@/lib/api";

const STATUS_STYLES: Record<DocMindDocument["status"], { color: string; label: string }> = {
  pending: { color: "bg-muted", label: "Pending" },
  indexing: { color: "bg-signal animate-pulse-red", label: "Indexing..." },
  indexed: { color: "bg-success", label: "Indexed" },
  failed: { color: "bg-signal", label: "Failed" },
};

export function StatusDot({ status }: { status: DocMindDocument["status"] }) {
  const style = STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
      <span className={clsx("h-2 w-2 rounded-full", style.color)} />
      {style.label}
    </span>
  );
}
