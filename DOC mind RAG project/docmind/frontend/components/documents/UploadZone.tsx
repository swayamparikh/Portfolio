"use client";

import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { api } from "@/lib/api";

export function UploadZone({ onUploaded }: { onUploaded: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      setError(null);
      try {
        for (const file of Array.from(files)) {
          await api.uploadDocument(file);
        }
        onUploaded();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        uploadFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center rounded-instrument border-2 border-dashed p-10 text-center transition-colors",
        dragging ? "border-signal bg-signal/5" : "border-hairline bg-white hover:border-signal/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.eml"
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files)}
      />
      <p className="font-heading text-sm font-semibold text-graphite">
        {uploading ? "Uploading..." : "Drag & drop PDFs, CSVs, or .eml files"}
      </p>
      <p className="mt-1 font-mono text-xs text-muted">or click to browse</p>
      {error && <p className="mt-3 font-mono text-xs text-signal">{error}</p>}
    </div>
  );
}
