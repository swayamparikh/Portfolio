export interface RawChunk {
  content: string;
  pageNumber?: number;
  rowRange?: string;
}

/** Splits text into overlapping chunks of roughly `chunkSize` characters, breaking on paragraph
 *  boundaries where possible so chunks stay semantically coherent. */
export function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > chunkSize && current) {
      chunks.push(current.trim());
      const tailStart = Math.max(0, current.length - overlap);
      current = current.slice(tailStart) + "\n\n" + para;
    } else {
      current = current ? current + "\n\n" + para : para;
    }

    while (current.length > chunkSize * 1.5) {
      chunks.push(current.slice(0, chunkSize).trim());
      current = current.slice(chunkSize - overlap);
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

/** Chunks pages of text (from a PDF) individually, preserving page numbers on each chunk. */
export function chunkPages(pages: string[], chunkSize: number, overlap: number): RawChunk[] {
  const chunks: RawChunk[] = [];
  pages.forEach((pageText, idx) => {
    const pageChunks = chunkText(pageText, chunkSize, overlap);
    for (const content of pageChunks) {
      chunks.push({ content, pageNumber: idx + 1 });
    }
  });
  return chunks;
}

/** Groups CSV rows (with a repeated header line) into row-range chunks sized by character count. */
export function chunkCsvRows(header: string, rows: string[], rowsPerChunk: number): RawChunk[] {
  const chunks: RawChunk[] = [];
  for (let i = 0; i < rows.length; i += rowsPerChunk) {
    const slice = rows.slice(i, i + rowsPerChunk);
    const content = [header, ...slice].join("\n");
    chunks.push({ content, rowRange: `${i + 1}-${i + slice.length}` });
  }
  return chunks;
}

export interface EmailTurn {
  from: string;
  date: string;
  text: string;
}

/** Chunks an email thread turn-by-turn (one chunk per message, or merged if very short). */
export function chunkEmailTurns(turns: EmailTurn[], chunkSize: number): RawChunk[] {
  const chunks: RawChunk[] = [];
  let buffer = "";
  let idx = 0;
  for (const turn of turns) {
    const turnText = `From: ${turn.from}\nDate: ${turn.date}\n\n${turn.text}`;
    if ((buffer + "\n\n---\n\n" + turnText).length > chunkSize && buffer) {
      chunks.push({ content: buffer, rowRange: `turn-${idx}` });
      idx++;
      buffer = turnText;
    } else {
      buffer = buffer ? buffer + "\n\n---\n\n" + turnText : turnText;
    }
  }
  if (buffer) chunks.push({ content: buffer, rowRange: `turn-${idx}` });
  return chunks;
}
