import { pool } from "../db/client.js";
import { parseAndChunk, type FileType } from "./parsing.js";
import { embedBatch, toVectorLiteral } from "./embeddings.js";
import { getSettings } from "./settings.js";

export async function ingestDocument(documentId: string, filePath: string, fileType: FileType) {
  const client = await pool.connect();
  try {
    await client.query("UPDATE documents SET status = 'indexing', error_message = NULL WHERE id = $1", [
      documentId,
    ]);

    const settings = await getSettings();
    const rawChunks = await parseAndChunk(filePath, fileType, settings.chunk_size, settings.chunk_overlap);

    if (rawChunks.length === 0) {
      throw new Error("No content could be extracted from this file.");
    }

    const embeddings = await embedBatch(rawChunks.map((c) => c.content));

    // Re-indexing: wipe this document's old chunks, insert fresh ones, without touching other documents.
    await client.query("BEGIN");
    await client.query("DELETE FROM chunks WHERE document_id = $1", [documentId]);

    for (let i = 0; i < rawChunks.length; i++) {
      const chunk = rawChunks[i];
      const vectorLiteral = toVectorLiteral(embeddings[i]);
      await client.query(
        `INSERT INTO chunks (document_id, chunk_index, content, page_number, row_range, embedding)
         VALUES ($1, $2, $3, $4, $5, $6::vector)`,
        [documentId, i, chunk.content, chunk.pageNumber ?? null, chunk.rowRange ?? null, vectorLiteral]
      );
    }

    await client.query(
      `UPDATE documents SET status = 'indexed', chunk_count = $2, last_indexed_at = now() WHERE id = $1`,
      [documentId, rawChunks.length]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    const message = err instanceof Error ? err.message : "Unknown ingestion error";
    await pool.query("UPDATE documents SET status = 'failed', error_message = $2 WHERE id = $1", [
      documentId,
      message,
    ]);
    throw err;
  } finally {
    client.release();
  }
}
