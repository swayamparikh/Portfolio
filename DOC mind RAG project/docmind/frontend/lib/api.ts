const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface DocMindDocument {
  id: string;
  filename: string;
  file_type: "pdf" | "csv" | "email";
  status: "pending" | "indexing" | "indexed" | "failed";
  error_message: string | null;
  uploaded_at: string;
  last_indexed_at: string | null;
  chunk_count: number;
}

export interface Citation {
  documentId: string;
  chunkId: string;
  page: number | null;
  snippet: string;
}

export interface AnswerResult {
  answer: string;
  citations: Citation[];
  confidence: "high" | "medium" | "low";
}

export interface Settings {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  reranking: boolean;
  model: string;
  temperature: number;
}

export interface EvalRun {
  id: string;
  run_at: string;
  chunk_size: number;
  top_k: number;
  temperature: number;
  overall_faithfulness: number | null;
  overall_relevance: number | null;
  overall_retrieval_accuracy: number | null;
}

export const api = {
  listDocuments: () => request<DocMindDocument[]>("/api/documents"),
  getDocument: (id: string) => request<any>(`/api/documents/${id}`),
  uploadDocument: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/documents/upload`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<DocMindDocument>;
  },
  reindexDocument: (id: string) => request(`/api/documents/${id}/reindex`, { method: "POST" }),
  deleteDocument: (id: string) => request<void>(`/api/documents/${id}`, { method: "DELETE" }),

  askQuestion: (question: string) =>
    request<AnswerResult>("/api/query", { method: "POST", body: JSON.stringify({ question }) }),

  getSettings: () => request<Settings>("/api/settings"),
  updateSettings: (patch: Partial<Settings>) =>
    request<Settings>("/api/settings", { method: "PUT", body: JSON.stringify(patch) }),

  listEvalSets: () => request<any[]>("/api/eval-sets"),
  addEvalSet: (question: string, expectedAnswer: string) =>
    request("/api/eval-sets", { method: "POST", body: JSON.stringify({ question, expectedAnswer }) }),
  runEval: (overrides?: { chunkSize?: number; topK?: number; temperature?: number }) =>
    request<{ evalRunId: string }>("/api/eval/run", { method: "POST", body: JSON.stringify(overrides ?? {}) }),
  listEvalRuns: () => request<EvalRun[]>("/api/eval/runs"),
  getEvalRun: (id: string) => request<any>(`/api/eval/runs/${id}`),
};
