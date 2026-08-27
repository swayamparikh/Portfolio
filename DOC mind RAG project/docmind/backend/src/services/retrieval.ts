import { pool } from "../db/client.js";
import { embedText, toVectorLiteral } from "./embeddings.js";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  filename: string;
  content: string;
  pageNumber: number | null;
  rowRange: string | null;
  similarity: number;
}

/** Vector search over chunks, with a lightweight lexical-overlap rerank as a second pass. */
export async function retrieveChunks(
  question: string,
  topK: number,
  rerank: boolean
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedText(question);
  const vectorLiteral = toVectorLiteral(queryEmbedding);

  // Over-fetch when reranking so the lexical pass has a real pool to choose from.
  const fetchLimit = rerank ? Math.max(topK * 3, topK) : topK;

  const { rows } = await pool.query(
    `SELECT c.id AS chunk_id, c.document_id, d.filename, c.content, c.page_number, c.row_range,
            1 - (c.embedding <=> $1::vector) AS similarity
     FROM chunks c
     JOIN documents d ON d.id = c.document_id
     ORDER BY c.embedding <=> $1::vector
     LIMIT $2`,
    [vectorLiteral, fetchLimit]
  );

  let candidates: RetrievedChunk[] = rows.map((r) => ({
    chunkId: r.chunk_id,
    documentId: r.document_id,
    filename: r.filename,
    content: r.content,
    pageNumber: r.page_number,
    rowRange: r.row_range,
    similarity: Number(r.similarity),
  }));

  if (rerank) {
    const questionTerms = new Set(
      question
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 2)
    );
    candidates = candidates
      .map((c) => {
        const contentTerms = c.content.toLowerCase().split(/\W+/);
        const overlap = contentTerms.filter((t) => questionTerms.has(t)).length;
        const lexicalScore = overlap / Math.max(1, questionTerms.size);
        // Blend vector similarity with lexical overlap so exact-term matches get a boost.
        const blended = c.similarity * 0.75 + lexicalScore * 0.25;
        return { ...c, similarity: blended };
      })
      .sort((a, b) => b.similarity - a.similarity);
  }

  return candidates.slice(0, topK);
}
