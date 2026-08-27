"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/StatusDot";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getDocument(id);
      setDoc(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleReindex() {
    setReindexing(true);
    await api.reindexDocument(id);
    setTimeout(refresh, 1500);
    setReindexing(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${doc.filename}" and all its chunks?`)) return;
    await api.deleteDocument(id);
    router.push("/documents");
  }

  if (loading) return <div className="p-8 font-mono text-sm text-muted">Loading...</div>;
  if (!doc) return <div className="p-8 font-mono text-sm text-signal">Document not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button onClick={() => router.push("/documents")} className="mb-4 font-mono text-xs text-muted hover:text-signal">
        ← Documents
      </button>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-graphite">{doc.filename}</h1>
            <p className="mt-1 font-mono text-xs text-muted">
              {doc.file_type.toUpperCase()} · uploaded {new Date(doc.uploaded_at).toLocaleString()}
            </p>
          </div>
          <StatusDot status={doc.status} />
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleReindex} disabled={reindexing}>
            {reindexing ? "Re-indexing..." : "Re-index this document"}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 font-heading text-sm font-semibold text-graphite">
          Chunks ({doc.chunks?.length ?? 0})
        </h2>
        <div className="flex flex-col gap-2">
          {doc.chunks?.map((chunk: any) => (
            <div key={chunk.id} className="rounded-instrument border border-hairline p-3">
              <p className="mb-1 font-mono text-[11px] text-muted">
                #{chunk.chunk_index} {chunk.page_number ? `· p.${chunk.page_number}` : ""}{" "}
                {chunk.row_range ? `· rows ${chunk.row_range}` : ""}
              </p>
              <p className="line-clamp-2 text-sm text-graphite">{chunk.content}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 font-heading text-sm font-semibold text-graphite">Questions that cited this document</h2>
        {doc.citedByQueries?.length ? (
          <div className="flex flex-col gap-2">
            {doc.citedByQueries.map((q: any) => (
              <div key={q.id} className="rounded-instrument border border-hairline p-3">
                <p className="text-sm font-medium text-graphite">{q.question}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">{new Date(q.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-muted">No questions have cited this document yet.</p>
        )}
      </Card>
    </div>
  );
}
