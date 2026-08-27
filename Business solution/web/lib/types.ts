export interface Business {
  id: string;
  name: string;
  businessType?: string;
  currency: string;
  reviewConfidenceThreshold?: number;
}

export interface Transaction {
  id: string;
  receiptId?: string | null;
  type: 'expense' | 'income';
  vendor: string;
  category: string;
  amount: number;
  taxAmount: number;
  currency: string;
  date: string;
  lineItems?: Array<{ description: string; amount: number }>;
  confidenceScore?: number;
  isRecurring?: boolean;
  notes?: string;
}

export interface ReceiptExtraction {
  vendor: string;
  date: string;
  totalAmount: number;
  taxAmount: number;
  currency: string;
  lineItems: Array<{ description: string; amount: number }>;
  suggestedCategory: string;
  type: 'expense' | 'income';
  confidence: { vendor: number; date: number; amount: number; category: number };
}

export interface Receipt {
  id: string;
  imageUrl: string;
  status: 'pending' | 'needs_review' | 'approved' | 'rejected';
  extracted?: ReceiptExtraction | null;
  uploadedAt?: string;
}

export interface MonthSeries {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
  byCategory: Record<string, number>;
  currency: string;
}

export interface Anomaly {
  id: string;
  transactionId: string;
  reason: string;
  flaggedAt: string;
}
