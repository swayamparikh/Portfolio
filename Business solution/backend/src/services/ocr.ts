import { createWorker } from 'tesseract.js';

/**
 * Provider-agnostic OCR wrapper. Tesseract.js runs locally (no per-image cost).
 * Swap the body of extractText() for a Google Cloud Vision call to upgrade
 * accuracy on messy receipts without touching any caller.
 */
export async function extractText(imagePath: string): Promise<string> {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(imagePath);
    return data.text || '';
  } finally {
    await worker.terminate();
  }
}
