import Groq from 'groq-sdk';
import 'dotenv/config';

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const apiKey = process.env.GROQ_API_KEY?.trim();
const groq = apiKey ? new Groq({ apiKey }) : null;

export interface ReceiptExtraction {
  vendor: string;
  date: string; // YYYY-MM-DD
  totalAmount: number;
  taxAmount: number;
  currency: string;
  lineItems: Array<{ description: string; amount: number }>;
  suggestedCategory: string;
  type: 'expense' | 'income';
  confidence: { vendor: number; date: number; amount: number; category: number };
}

const CATEGORIES = ['Rent', 'Utilities', 'Supplies', 'Payroll', 'Marketing', 'Travel', 'Equipment', 'Food/Meals', 'Services', 'Sales', 'Other'];

async function chatJSON(system: string, user: string): Promise<any> {
  if (!groq) throw new Error('NO_GROQ_KEY');
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });
  const text = completion.choices[0]?.message?.content || '{}';
  return JSON.parse(text);
}

/** Raw OCR text -> structured JSON. Falls back to a deterministic heuristic mock without a Groq key. */
export async function extractReceiptData(ocrText: string, currencyHint = 'USD'): Promise<ReceiptExtraction> {
  if (groq) {
    try {
      const json = await chatJSON(
        `You extract structured data from receipt/invoice OCR text for a small-business bookkeeping app.
Return STRICT JSON only, matching this shape:
{"vendor": string, "date": "YYYY-MM-DD", "totalAmount": number, "taxAmount": number, "currency": "USD|INR|EUR|GBP",
 "lineItems": [{"description": string, "amount": number}], "suggestedCategory": one of [${CATEGORIES.join(', ')}],
 "type": "expense"|"income",
 "confidence": {"vendor": 0-1, "date": 0-1, "amount": 0-1, "category": 0-1}}
If OCR text is noisy/unclear on a field, lower that field's confidence honestly instead of guessing high.`,
        `Currency hint: ${currencyHint}\nOCR TEXT:\n"""${ocrText.slice(0, 4000)}"""`
      );
      return normalizeExtraction(json, currencyHint);
    } catch (err) {
      console.warn('Groq extraction failed, falling back to mock:', (err as Error).message);
    }
  }
  return mockExtraction(ocrText, currencyHint);
}

export async function categorizeTransaction(description: string, amount: number, businessType?: string): Promise<{ category: string; confidence: number }> {
  if (groq) {
    try {
      const json = await chatJSON(
        `Classify a small-business transaction into exactly one category from [${CATEGORIES.join(', ')}]. Return STRICT JSON: {"category": string, "confidence": 0-1}.`,
        `Business type: ${businessType || 'unspecified'}\nDescription: ${description}\nAmount: ${amount}`
      );
      return { category: CATEGORIES.includes(json.category) ? json.category : 'Other', confidence: clamp01(json.confidence ?? 0.7) };
    } catch (err) {
      console.warn('Groq categorization failed, falling back to mock:', (err as Error).message);
    }
  }
  return mockCategorize(description);
}

/** Feed a compact aggregated summary (not every raw transaction) to keep prompts small and free-tier-friendly. */
export async function generateMonthlyNarrative(summary: {
  month: string; income: number; expense: number; net: number; byCategory: Record<string, number>;
  prevIncome?: number; prevExpense?: number; currency: string;
}): Promise<string> {
  if (groq) {
    try {
      const json = await chatJSON(
        `You write short, plain-English monthly profit & loss summaries for small-business owners with zero accounting knowledge.
Never use jargon like "accrual", "COGS", "EBITDA" unless you explain it simply in the same breath.
Return STRICT JSON: {"narrative": string} — 2-4 warm, direct sentences, like a smart friend explaining their finances.`,
        JSON.stringify(summary)
      );
      if (json.narrative) return json.narrative;
    } catch (err) {
      console.warn('Groq narrative failed, falling back to mock:', (err as Error).message);
    }
  }
  return mockNarrative(summary);
}

export async function answerFinanceQuestion(question: string, summary: {
  monthly: Array<{ month: string; income: number; expense: number; net: number; byCategory: Record<string, number> }>;
  currency: string;
}): Promise<string> {
  if (groq) {
    try {
      const json = await chatJSON(
        `You answer a small-business owner's questions about their own finances using ONLY the aggregated monthly data provided.
Be direct, plain-English, one short paragraph. Return STRICT JSON: {"answer": string}.`,
        `Question: ${question}\nData: ${JSON.stringify(summary)}`
      );
      if (json.answer) return json.answer;
    } catch (err) {
      console.warn('Groq Q&A failed, falling back to mock:', (err as Error).message);
    }
  }
  return mockAnswer(question, summary);
}

export interface Anomaly { transactionId: string; reason: string }
export async function detectAnomalies(transactions: Array<{ id: string; category: string; amount: number; vendor: string }>): Promise<Anomaly[]> {
  const byCat: Record<string, typeof transactions> = {};
  for (const t of transactions) (byCat[t.category] ||= []).push(t);
  const out: Anomaly[] = [];
  for (const [cat, list] of Object.entries(byCat)) {
    if (list.length < 3) continue;
    const avg = list.reduce((a, t) => a + t.amount, 0) / list.length;
    for (const t of list) {
      if (t.amount > avg * 2.2) out.push({ transactionId: t.id, reason: `${t.vendor} — ${cat} charge of ${t.amount.toFixed(2)} is well above your ${cat} average of ${avg.toFixed(2)}` });
    }
  }
  return out;
}

/* ---------------- Mock fallbacks (no GROQ_API_KEY needed) ---------------- */

function normalizeExtraction(json: any, currencyHint: string): ReceiptExtraction {
  return {
    vendor: json.vendor || 'Unknown vendor',
    date: json.date || new Date().toISOString().slice(0, 10),
    totalAmount: Number(json.totalAmount) || 0,
    taxAmount: Number(json.taxAmount) || 0,
    currency: json.currency || currencyHint,
    lineItems: Array.isArray(json.lineItems) ? json.lineItems : [],
    suggestedCategory: CATEGORIES.includes(json.suggestedCategory) ? json.suggestedCategory : 'Other',
    type: json.type === 'income' ? 'income' : 'expense',
    confidence: {
      vendor: clamp01(json.confidence?.vendor ?? 0.8),
      date: clamp01(json.confidence?.date ?? 0.8),
      amount: clamp01(json.confidence?.amount ?? 0.8),
      category: clamp01(json.confidence?.category ?? 0.8)
    }
  };
}

function mockExtraction(ocrText: string, currencyHint: string): ReceiptExtraction {
  const lines = ocrText.split('\n').map((l) => l.trim()).filter(Boolean);
  const amountMatch = ocrText.match(/(?:total|amount due|balance)\D{0,10}([\d,]+\.\d{2})/i) || ocrText.match(/([\d,]+\.\d{2})/);
  const dateMatch = ocrText.match(/(\d{4}-\d{2}-\d{2})/) || ocrText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  const vendor = lines[0]?.slice(0, 60) || 'Unknown vendor';
  const total = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
  const { category, confidence: catConf } = mockCategorize(vendor);
  return {
    vendor,
    date: dateMatch ? normalizeDate(dateMatch[1]) : new Date().toISOString().slice(0, 10),
    totalAmount: Math.round(total * 100) / 100,
    taxAmount: Math.round(total * 0.08 * 100) / 100,
    currency: currencyHint,
    lineItems: total ? [{ description: 'Itemized total', amount: total }] : [],
    suggestedCategory: category,
    type: 'expense',
    confidence: {
      vendor: lines[0] ? 0.85 : 0.4,
      date: dateMatch ? 0.88 : 0.5,
      amount: amountMatch ? 0.9 : 0.35,
      category: catConf
    }
  };
}

function mockCategorize(description: string): { category: string; confidence: number } {
  const d = description.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/rent|lease|property/, 'Rent'],
    [/power|electric|water|gas|utility|comcast|internet/, 'Utilities'],
    [/office|depot|staples|uline|amazon|supply|supplies/, 'Supplies'],
    [/payroll|salary|wage|contractor/, 'Payroll'],
    [/ads|marketing|meta|google ads|canva|mailchimp/, 'Marketing'],
    [/uber|lyft|flight|airline|hotel|fuel|shell|delta/, 'Travel'],
    [/dell|best buy|laptop|equipment|hardware/, 'Equipment'],
    [/cafe|diner|pizza|restaurant|coffee|meal/, 'Food/Meals'],
    [/invoice|customer|sale|order/, 'Sales'],
    [/host|stripe|legal|books|subscription|service/, 'Services']
  ];
  for (const [re, cat] of rules) if (re.test(d)) return { category: cat, confidence: 0.82 };
  return { category: 'Other', confidence: 0.55 };
}

function mockNarrative(s: { income: number; expense: number; net: number; byCategory: Record<string, number>; currency: string }): string {
  const sym = ({ USD: '$', INR: '₹', EUR: '€', GBP: '£' } as Record<string, string>)[s.currency] || '$';
  const money = (n: number) => sym + Math.abs(Math.round(n)).toLocaleString();
  const top = Object.entries(s.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c.toLowerCase());
  if (!s.income && !s.expense) return "No activity recorded this month yet. Snap your first receipt and I'll start building your picture.";
  const outlook = s.net >= 0 ? "You're on track for a healthy margin — nice work." : "You spent more than you earned this month — worth a look before it becomes a habit.";
  return `This month you made ${money(s.income)} in revenue and spent ${money(s.expense)}, mostly on ${top.join(' and ') || 'various expenses'}. That leaves you with a ${s.net >= 0 ? 'net profit' : 'net loss'} of ${money(s.net)}. ${outlook}`;
}

function mockAnswer(question: string, summary: { monthly: Array<{ month: string; income: number; expense: number; net: number; byCategory: Record<string, number> }>; currency: string }): string {
  const sym = ({ USD: '$', INR: '₹', EUR: '€', GBP: '£' } as Record<string, string>)[summary.currency] || '$';
  const money = (n: number) => sym + Math.abs(Math.round(n)).toLocaleString();
  const cur = summary.monthly[summary.monthly.length - 1] || { income: 0, expense: 0, net: 0, byCategory: {} };
  const ql = question.toLowerCase();
  if (/profit|net|make|made/.test(ql)) return `This month you're at a net of ${money(cur.net)} (${money(cur.income)} in, ${money(cur.expense)} out).`;
  const catHit = Object.keys(cur.byCategory).find((c) => ql.includes(c.toLowerCase().split('/')[0]));
  if (catHit) return `You spent ${money(cur.byCategory[catHit])} on ${catHit} this month.`;
  const top = Object.entries(cur.byCategory).sort((a, b) => b[1] - a[1])[0];
  if (top) return `Your biggest expense this month is ${top[0]} at ${money(top[1])}.`;
  return `This month: ${money(cur.income)} in, ${money(cur.expense)} out, net ${money(cur.net)}.`;
}

function normalizeDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const [m, d, y] = raw.split('/').map((x) => parseInt(x, 10));
  const year = y < 100 ? 2000 + y : y;
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function clamp01(n: number) { return Math.max(0, Math.min(1, Number(n) || 0)); }
