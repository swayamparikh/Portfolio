"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type DocMindDocument } from "@/lib/api";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentCard } from "@/components/documents/DocumentCard";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocMindDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const hasActive = () => documents.some((d) => d.status === "pending" || d.status === "indexing");
    const interval = setInterval(() => {
      if (hasActive() || documents.length === 0) refresh();
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, documents.length]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-graphite">Documents</h1>
      </div>

      <div className="mb-8">
        <UploadZone onUploaded={refresh} />
      </div>

      {error && <p className="mb-4 font-mono text-sm text-signal">{error}</p>}

      {loading ? (
        <p className="font-mono text-sm text-muted">Loading...</p>
      ) : documents.length === 0 ? (
        <p className="font-mono text-sm text-muted">No documents yet. Upload one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
