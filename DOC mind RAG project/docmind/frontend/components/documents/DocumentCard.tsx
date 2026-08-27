import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { ScanLine } from "@/components/ui/ScanLine";
import type { DocMindDocument } from "@/lib/api";

function timeAgo(iso: string | null) {
  if (!iso) return "never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const TYPE_ICON: Record<DocMindDocument["file_type"], string> = {
  pdf: "PDF",
  csv: "CSV",
  email: "EML",
};

export function DocumentCard({ doc }: { doc: DocMindDocument }) {
  return (
    <Link href={`/documents/${doc.id}`}>
      <Card className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted">
            {TYPE_ICON[doc.file_type]}
          </span>
          <StatusDot status={doc.status} />
        </div>
        <p className="truncate font-heading text-sm font-semibold text-graphite" title={doc.filename}>
          {doc.filename}
        </p>
        {doc.status === "indexing" && <ScanLine />}
        {doc.status === "failed" && doc.error_message && (
          <p className="font-mono text-[11px] text-signal">{doc.error_message}</p>
        )}
        <div className="mt-auto flex items-center justify-between font-mono text-[11px] text-muted">
          <span>{doc.chunk_count} chunks</span>
          <span>indexed {timeAgo(doc.last_indexed_at)}</span>
        </div>
      </Card>
    </Link>
  );
}
