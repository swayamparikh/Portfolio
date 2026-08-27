import { pipeline, type FeatureExtractionPipeline } from "@xenova/transformers";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    ) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

export const EMBEDDING_DIM = 384;

export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const results: number[][] = [];
  for (const text of texts) {
    const output = await extractor(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data as Float32Array));
  }
  return results;
}

export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
