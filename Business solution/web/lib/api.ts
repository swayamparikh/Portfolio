const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ledgerlite.token');
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('ledgerlite.token', token);
  else localStorage.removeItem('ledgerlite.token');
}

async function request(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const isForm = opts.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {})
    }
  });
  if (res.status === 401) {
    setToken(null);
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/pdf')) return res.blob();
  return res.json();
}

export const api = {
  signup: (email: string, password: string, name?: string) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  listBusinesses: () => request('/api/businesses'),
  createBusiness: (data: { name: string; businessType?: string; currency: string }) =>
    request('/api/businesses', { method: 'POST', body: JSON.stringify(data) }),
  updateBusinessSettings: (id: string, data: any) =>
    request(`/api/businesses/${id}/settings`, { method: 'PUT', body: JSON.stringify(data) }),

  uploadReceipt: (businessId: string, file: File) => {
    const fd = new FormData();
    fd.append('businessId', businessId);
    fd.append('image', file);
    return request('/api/receipts/upload', { method: 'POST', body: fd });
  },
  listReceipts: (businessId: string, status?: string) =>
    request(`/api/receipts?businessId=${businessId}${status ? `&status=${status}` : ''}`),
  approveReceipt: (id: string, edits: any) =>
    request(`/api/receipts/${id}/approve`, { method: 'POST', body: JSON.stringify(edits) }),
  rejectReceipt: (id: string) => request(`/api/receipts/${id}/reject`, { method: 'PUT' }),

  listTransactions: (businessId: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams({ businessId, ...params }).toString();
    return request(`/api/transactions?${qs}`);
  },
  createTransaction: (data: any) => request('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: string, data: any) => request(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: string) => request(`/api/transactions/${id}`, { method: 'DELETE' }),

  monthlyReport: (businessId: string, month: string) => request(`/api/reports/monthly/${businessId}/${month}`),
  generateMonthlyReport: (businessId: string, month: string) => request(`/api/reports/monthly/${businessId}/${month}/generate`, { method: 'POST' }),
  monthlyPdfUrl: (businessId: string, month: string) => `${API_URL}/api/reports/monthly/${businessId}/${month}/pdf`,
  series: (businessId: string, months = 6) => request(`/api/reports/series/${businessId}?months=${months}`),

  ask: (businessId: string, question: string) => request('/api/ai/ask', { method: 'POST', body: JSON.stringify({ businessId, question }) }),

  anomalies: (businessId: string) => request(`/api/anomalies/${businessId}`),
  dismissAnomaly: (id: string) => request(`/api/anomalies/${id}/dismiss`, { method: 'PUT' }),

  categories: (businessId: string) => request(`/api/categories/${businessId}`),
  createCategory: (data: { businessId: string; name: string; type: 'expense' | 'income' }) =>
    request('/api/categories', { method: 'POST', body: JSON.stringify(data) })
};

export async function downloadPdf(businessId: string, month: string) {
  const token = getToken();
  const res = await fetch(api.monthlyPdfUrl(businessId, month), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Could not generate PDF');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `ledgerlite-${month}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

export { API_URL };
