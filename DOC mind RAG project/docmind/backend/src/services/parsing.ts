import { readFile } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";
import { parse as parseCsvSync } from "csv-parse/sync";
import { simpleParser } from "mailparser";
import type { RawChunk, EmailTurn } from "./chunking.js";
import { chunkPages, chunkCsvRows, chunkEmailTurns } from "./chunking.js";

export type FileType = "pdf" | "csv" | "email";

export function detectFileType(filename: string): FileType {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (ext === "csv") return "csv";
  if (ext === "eml") return "email";
  throw new Error(`Unsupported file type: .${ext}`);
}

export async function parseAndChunk(
  filePath: string,
  fileType: FileType,
  chunkSize: number,
  overlap: number
): Promise<RawChunk[]> {
  const buffer = await readFile(filePath);

  if (fileType === "pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });
    const pages = Array.isArray(text) ? text : [text];
    void totalPages;
    return chunkPages(pages, chunkSize, overlap);
  }

  if (fileType === "csv") {
    const records: string[][] = parseCsvSync(buffer, { relax_column_count: true });
    if (records.length === 0) return [];
    const header = records[0].join(",");
    const rows = records.slice(1).map((r) => r.join(","));
    const rowsPerChunk = Math.max(5, Math.floor(chunkSize / 80));
    return chunkCsvRows(header, rows, rowsPerChunk);
  }

  // email (.eml)
  const parsed = await simpleParser(buffer);
  const turns: EmailTurn[] = [
    {
      from: parsed.from?.text ?? "unknown",
      date: parsed.date?.toISOString() ?? "unknown",
      text: parsed.text ?? parsed.html?.toString() ?? "",
    },
  ];
  return chunkEmailTurns(turns, chunkSize);
}
