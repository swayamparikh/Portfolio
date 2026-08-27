/* ============================================================
   LedgerLite — front-end demo app
   Self-contained: mock OCR/AI pipeline + localStorage persistence.
   Idea & concept by Swayam Parikh.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Utilities ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const uid = () => 'id' + Math.random().toString(36).slice(2, 10);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const CUR = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };
  const fmt = (n, code = state().currency) =>
    (n < 0 ? '-' : '') + (CUR[code] || '$') + Math.abs(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmt2 = (n, code = state().currency) =>
    (n < 0 ? '-' : '') + (CUR[code] || '$') + Math.abs(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = (d) => { const x = new Date(d); return `${MONTHS[x.getMonth()]} ${x.getDate()}, ${x.getFullYear()}`; };
  const monthKey = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`; };

  const CATS = {
    Rent: '🏠', Utilities: '💡', Supplies: '📦', Payroll: '👥', Marketing: '📣',
    Travel: '✈️', Equipment: '🖥️', 'Food/Meals': '🍽️', Sales: '💰', Services: '🧾', Other: '•'
  };
  const catIcon = (c) => CATS[c] || '•';

  /* ---------- Seed data ---------- */
  const VENDORS = {
    Supplies: ['Office Depot', 'Staples', 'Uline', 'Amazon Business', 'Costco Wholesale'],
    Utilities: ['City Power & Light', 'AquaFlow Water', 'Comcast Business', 'GreenGas Co'],
    Rent: ['Maple Property Mgmt', 'Downtown Lofts LLC'],
    Marketing: ['Meta Ads', 'Google Ads', 'Canva Pro', 'Mailchimp'],
    'Food/Meals': ['The Corner Cafe', 'Sunrise Diner', 'Bella Pizza', 'Green Bowl'],
    Travel: ['Uber', 'Delta Air', 'Shell Fuel', 'HotelStay Inc'],
    Equipment: ['Best Buy', 'Dell Store', 'ToolMart'],
    Payroll: ['Payroll Run', 'Contractor Payout'],
    Services: ['CloudHost Inc', 'Stripe Fees', 'QuickLegal', 'BrightBooks'],
    Sales: ['Customer Invoice', 'Online Store', 'Walk-in Sales', 'Wholesale Order']
  };
  const EXP_CATS = ['Rent', 'Utilities', 'Supplies', 'Payroll', 'Marketing', 'Travel', 'Equipment', 'Food/Meals', 'Services', 'Other'];

  function seedTxns(businessId, curr) {
    const rng = mulberry(hash(businessId));
    const list = [];
    const now = new Date('2026-07-20');
    for (let m = 5; m >= 0; m--) {
      const base = new Date(now.getFullYear(), now.getMonth() - m, 1);
      // income (2-4 sales)
      const incomeCount = 2 + Math.floor(rng() * 3);
      for (let i = 0; i < incomeCount; i++) {
        const day = 1 + Math.floor(rng() * 26);
        list.push(mkTxn(businessId, curr, 'income', 'Sales', pick(VENDORS.Sales, rng),
          2200 + Math.floor(rng() * 4200), new Date(base.getFullYear(), base.getMonth(), day)));
      }
      // expenses (6-10)
      const expCount = 6 + Math.floor(rng() * 5);
      for (let i = 0; i < expCount; i++) {
        const cat = pick(EXP_CATS.filter(c => c !== 'Other'), rng);
        const day = 1 + Math.floor(rng() * 26);
        let amt = ({ Rent: 1600, Payroll: 2400, Utilities: 240, Supplies: 320, Marketing: 480, Travel: 180, Equipment: 900, 'Food/Meals': 60, Services: 120 }[cat] || 150);
        amt = Math.round(amt * (0.6 + rng() * 0.9));
        list.push(mkTxn(businessId, curr, 'expense', cat, pick(VENDORS[cat] || VENDORS.Supplies, rng), amt,
          new Date(base.getFullYear(), base.getMonth(), day)));
      }
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  function mkTxn(businessId, curr, type, cat, vendor, amount, date) {
    return { id: uid(), businessId, type, category: cat, vendor, amount,
      tax: Math.round(amount * 0.08), currency: curr, date: date.toISOString().slice(0, 10),
      confidence: 0.9 + Math.random() * 0.09, recurring: cat === 'Rent', notes: '', receipt: true };
  }
  const pick = (arr, rng) => arr[Math.floor((rng ? rng() : Math.random()) * arr.length)];
  function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

  /* ---------- Persistent state ---------- */
  const KEY = 'ledgerlite.v1';
  let DB;
  function boot() {
    try { DB = JSON.parse(localStorage.getItem(KEY)); } catch { DB = null; }
    if (!DB || !DB.businesses) {
      const b1 = { id: uid(), name: 'Bloom & Co. Flowers', type: 'retail', currency: 'USD' };
      const b2 = { id: uid(), name: 'Parikh Freelance Studio', type: 'freelance', currency: 'INR' };
      DB = {
        activeBiz: b1.id,
        businesses: [b1, b2],
        txns: [...seedTxns(b1.id, 'USD'), ...seedTxns(b2.id, 'INR')],
        queue: [],
        chats: {}
      };
      // A couple pending review items for demo
      DB.queue = [makeReviewItem(b1.id, 'USD'), makeReviewItem(b1.id, 'USD')];
      save();
    }
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(DB));
  const state = () => DB.businesses.find(b => b.id === DB.activeBiz) || DB.businesses[0];
  const bizTxns = () => DB.txns.filter(t => t.businessId === DB.activeBiz);
  const bizQueue = () => DB.queue.filter(t => t.businessId === DB.activeBiz);

  /* ---------- Mock OCR/AI extraction ---------- */
  const SAMPLE_RECEIPTS = [
    { vendor: 'Office Depot', cat: 'Supplies', items: [['Printer Paper A4 x5', 42.5], ['Ink Cartridge HP-63', 38.99], ['Sticky Notes', 6.49]] },
    { vendor: 'The Corner Cafe', cat: 'Food/Meals', items: [['Team Lunch (4)', 58.0], ['Coffee x2', 9.5]] },
    { vendor: 'Shell Fuel', cat: 'Travel', items: [['Unleaded 32.4L', 61.2]] },
    { vendor: 'City Power & Light', cat: 'Utilities', items: [['Electricity — June', 214.7]] },
    { vendor: 'Canva Pro', cat: 'Marketing', items: [['Annual subscription', 119.99]] },
    { vendor: 'Best Buy', cat: 'Equipment', items: [['USB-C Hub', 49.99], ['Wireless Mouse', 29.99]] }
  ];
  function makeReviewItem(businessId, curr) {
    const s = SAMPLE_RECEIPTS[Math.floor(Math.random() * SAMPLE_RECEIPTS.length)];
    const total = s.items.reduce((a, [, p]) => a + p, 0);
    const d = new Date(2026, 6, 1 + Math.floor(Math.random() * 19));
    // simulate a couple of low-confidence fields
    const dateConf = 0.6 + Math.random() * 0.38;
    const amtConf = 0.78 + Math.random() * 0.2;
    return {
      id: uid(), businessId, currency: curr,
      vendor: s.vendor, category: s.cat, type: 'expense',
      amount: Math.round(total * 100) / 100, tax: Math.round(total * 0.08 * 100) / 100,
      date: d.toISOString().slice(0, 10), items: s.items.map(([description, amount]) => ({ description, amount })),
      conf: { vendor: 0.9 + Math.random() * 0.09, amount: amtConf, date: dateConf, category: 0.82 + Math.random() * 0.15 }
    };
  }

  /* ---------- Aggregation ---------- */
  function aggregate(txns, mKey) {
    const inMonth = mKey ? txns.filter(t => monthKey(t.date) === mKey) : txns;
    let income = 0, expense = 0; const byCat = {};
    for (const t of inMonth) {
      if (t.type === 'income') income += t.amount;
      else { expense += t.amount; byCat[t.category] = (byCat[t.category] || 0) + t.amount; }
    }
    return { income, expense, net: income - expense, byCat, count: inMonth.length };
  }
  function monthlySeries(txns, n = 6) {
    const now = new Date('2026-07-20');
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mk = monthKey(d);
      const a = aggregate(txns, mk);
      out.push({ label: MONTHS[d.getMonth()], mk, ...a });
    }
    return out;
  }

  /* ---------- Mock AI narrative ---------- */
  function narrative(txns) {
    const series = monthlySeries(txns, 2);
    const cur = series[1], prev = series[0];
    if (!cur.count) return "No activity recorded this month yet. Snap your first receipt and I'll start building your picture.";
    const top = Object.entries(cur.byCat).sort((a, b) => b[1] - a[1]).slice(0, 2);
    const topStr = top.map(([c]) => c.toLowerCase()).join(' and ');
    let deltaTxt = '';
    if (prev.count && top[0]) {
      const p = prev.byCat[top[0][0]] || 0, c = top[0][1];
      if (p > 0) { const pct = Math.round((c - p) / p * 100); deltaTxt = pct !== 0 ? ` (${pct > 0 ? 'up' : 'down'} ${Math.abs(pct)}% from last month)` : ''; }
    }
    const marginNow = cur.income ? cur.net / cur.income : 0;
    const marginPrev = prev.income ? prev.net / prev.income : 0;
    const outlook = cur.net >= 0
      ? (marginNow >= marginPrev ? "You're on track for a healthier margin than last month — nice work." : "Your margin dipped a little this month, mostly from higher spending, but you're still profitable.")
      : "You spent more than you earned this month — worth a look before it becomes a habit.";
    return `This month you made ${fmt(cur.income)} in revenue and spent ${fmt(cur.expense)}, mostly on ${topStr}${deltaTxt}. That leaves you with a ${cur.net >= 0 ? 'net profit' : 'net loss'} of ${fmt(Math.abs(cur.net))}. ${outlook}`;
  }

  /* ---------- Mock AI Q&A ---------- */
  function answer(q, txns) {
    const ql = q.toLowerCase();
    const series = monthlySeries(txns, 6);
    const cur = series[series.length - 1];
    const findCat = () => EXP_CATS.concat(['sales', 'income', 'revenue']).find(c => ql.includes(c.toLowerCase().split('/')[0]));
    if (/(profit|make|made|net|earn)/.test(ql)) {
      const tot = series.reduce((a, s) => a + s.net, 0);
      return `Over the last 6 months your net was ${fmt(tot)}. This month specifically you're at ${fmt(cur.net)} (${fmt(cur.income)} in, ${fmt(cur.expense)} out).`;
    }
    const cat = findCat();
    if (cat && /(supply|supplies|rent|utilit|marketing|travel|payroll|equipment|food|meal|service)/.test(ql)) {
      const norm = EXP_CATS.find(c => c.toLowerCase().includes(cat.toLowerCase().split('/')[0])) || 'Supplies';
      const q3 = series.slice(-3).reduce((a, s) => a + (s.byCat[norm] || 0), 0);
      const thisM = cur.byCat[norm] || 0;
      return `You spent ${fmt(thisM)} on ${norm} this month, and ${fmt(q3)} across the last quarter. It's ${thisM > (q3 / 3) ? 'above' : 'around'} your recent average.`;
    }
    if (/(most|biggest|largest|top).*(spend|expense|cost|category)/.test(ql) || /where.*money/.test(ql)) {
      const top = Object.entries(cur.byCat).sort((a, b) => b[1] - a[1])[0];
      return top ? `Your biggest expense this month is ${top[0]} at ${fmt(top[1])} — that's ${Math.round(top[1] / cur.expense * 100)}% of your spending.` : "No expenses logged this month yet.";
    }
    if (/(compare|last year|more than|vs)/.test(ql)) {
      const half1 = series.slice(0, 3).reduce((a, s) => a + s.expense, 0);
      const half2 = series.slice(3).reduce((a, s) => a + s.expense, 0);
      const pct = half1 ? Math.round((half2 - half1) / half1 * 100) : 0;
      return `Comparing the last 3 months to the 3 before, your spending is ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct)}% (${fmt(half2)} vs ${fmt(half1)}).`;
    }
    if (/(income|revenue|sales)/.test(ql)) {
      const tot = series.reduce((a, s) => a + s.income, 0);
      return `You've brought in ${fmt(tot)} over the last 6 months, ${fmt(cur.income)} of it this month.`;
    }
    // default
    return `Here's a quick snapshot: this month you earned ${fmt(cur.income)}, spent ${fmt(cur.expense)}, for a net of ${fmt(cur.net)}. Ask me about a specific category, profit, or how you compare to earlier months.`;
  }

  /* ---------- Anomalies ---------- */
  function anomalies(txns) {
    const byCat = {};
    txns.filter(t => t.type === 'expense').forEach(t => { (byCat[t.category] ||= []).push(t); });
    const out = [];
    for (const [cat, list] of Object.entries(byCat)) {
      if (list.length < 3) continue;
      const avg = list.reduce((a, t) => a + t.amount, 0) / list.length;
      list.forEach(t => { if (t.amount > avg * 2.2) out.push({ t, reason: `${fmt(t.amount)} is well above your ${cat} average of ${fmt(avg)}` }); });
    }
    return out.slice(0, 4);
  }

  /* ============================================================
     VIEWS
     ============================================================ */
  const content = $('#content');
  let animatedOnce = {};

  const TITLES = { dashboard: 'Dashboard', scan: 'Scan Receipt', review: 'Review Queue', ledger: 'Ledger', reports: 'Reports', ask: 'Ask AI' };

  const Views = {
    /* ---- Dashboard ---- */
    dashboard() {
      const txns = bizTxns();
      const series = monthlySeries(txns, 6);
      const cur = series[series.length - 1];
      const prev = series[series.length - 2] || { net: 0, income: 0, expense: 0 };
      const anoms = anomalies(txns);
      const dNet = prev.net ? Math.round((cur.net - prev.net) / Math.abs(prev.net) * 100) : 0;
      const cashLow = cur.expense > cur.income * 1.05;

      const v = el(`<div class="view">
        ${cashLow ? `<div class="card" style="border-color:var(--amber);background:var(--amber-soft);display:flex;gap:10px;align-items:center">
          <span style="font-size:20px">⚠️</span>
          <div><strong>Low cash-flow heads-up.</strong> <span class="hint" style="color:#B4791E">Spending is outpacing income this month by ${fmt(cur.expense - cur.income)}.</span></div>
        </div>` : ''}

        <div class="kpis" style="margin-bottom:6px">
          <div class="kpi"><div class="kpi-label">💰 Revenue</div><div class="kpi-val pos" data-count="${cur.income}">${fmt(0)}</div><div class="kpi-sub">this month</div></div>
          <div class="kpi"><div class="kpi-label">💸 Expenses</div><div class="kpi-val" data-count="${cur.expense}">${fmt(0)}</div><div class="kpi-sub">this month</div></div>
          <div class="kpi"><div class="kpi-label">📈 Net profit</div><div class="kpi-val ${cur.net >= 0 ? 'pos' : 'neg'}" data-count="${cur.net}">${fmt(0)}</div><div class="kpi-sub ${dNet >= 0 ? 'trend-up' : 'trend-down'}">${dNet >= 0 ? '▲' : '▼'} ${Math.abs(dNet)}% vs last month</div></div>
          <div class="kpi"><div class="kpi-label">🧾 Transactions</div><div class="kpi-val" data-count="${cur.count}" data-plain="1">0</div><div class="kpi-sub">${bizQueue().length} awaiting review</div></div>
        </div>

        <div class="card narrative">
          <div class="spark">✦</div>
          <div class="n-month">${MONTHS[new Date('2026-07-20').getMonth()]} 2026 · Plain-English summary</div>
          <div class="n-head"><span class="n-badge">✦ AI Summary</span></div>
          <p>${esc(narrative(txns))}</p>
        </div>

        <div class="card">
          <div class="section-head"><h2>Revenue vs. expenses</h2><span class="sub">last 6 months</span></div>
          <div class="chart-wrap">${barChart(series)}</div>
          <div class="legend">
            <span class="li"><span class="dot" style="background:var(--green)"></span>Income</span>
            <span class="li"><span class="dot" style="background:var(--ink)"></span>Expenses</span>
          </div>
        </div>

        <div class="card">
          <div class="section-head"><h2>Where the money goes</h2><span class="sub">this month</span></div>
          ${donut(cur.byCat)}
        </div>

        ${anoms.length ? `<div class="card">
          <div class="section-head"><h2>⚠️ Flagged for you</h2><span class="sub">unusual spend</span></div>
          ${anoms.map(a => `<div class="txn"><div class="txn-ic" style="background:var(--red-soft);color:var(--red)">!</div>
            <div class="txn-main"><div class="txn-vendor">${esc(a.t.vendor)}</div><div class="txn-meta">${esc(a.reason)}</div></div>
            <div class="txn-amt expense">${fmt(a.t.amount)}</div></div>`).join('')}
        </div>` : ''}

        <div class="card">
          <div class="section-head"><h2>Recent activity</h2><button class="btn btn-ghost btn-sm" data-view="ledger">View all</button></div>
          <div class="txn-list">${txns.slice(0, 5).map(txnRow).join('')}</div>
        </div>
      </div>`);
      requestAnimationFrame(() => countUp(v));
      return v;
    },

    /* ---- Scan ---- */
    scan() {
      const v = el(`<div class="view">
        <div class="scanner" id="scanRoot"></div>
      </div>`);
      queueMicrotask(() => renderScanCamera(v.querySelector('#scanRoot')));
      return v;
    },

    /* ---- Review Queue ---- */
    review() {
      const q = bizQueue();
      const v = el(`<div class="view">
        <div class="section-head">
          <div><h2>Needs review</h2><span class="sub">${q.length} receipt${q.length === 1 ? '' : 's'} · confirm or correct low-confidence fields</span></div>
          ${q.length ? `<button class="btn btn-ghost btn-sm" id="bulkApprove">Approve all high-confidence</button>` : ''}
        </div>
        <div id="reviewList"></div>
      </div>`);
      const list = $('#reviewList', v);
      if (!q.length) {
        list.appendChild(el(`<div class="empty"><div class="em-ic">☑</div><h3>Inbox zero 🎉</h3><p>No receipts waiting. Scan one and it'll land here for a quick check.</p><button class="btn btn-primary" data-view="scan" style="margin-top:12px">＋ Scan a receipt</button></div>`));
      } else {
        q.forEach(item => list.appendChild(reviewCard(item)));
      }
      const bulk = $('#bulkApprove', v);
      if (bulk) bulk.onclick = () => {
        const good = bizQueue().filter(i => Math.min(...Object.values(i.conf)) >= 0.85);
        good.forEach(i => approveReview(i.id, true));
        toast(`Approved ${good.length} high-confidence receipt${good.length === 1 ? '' : 's'}`, 'good');
        render('review');
      };
      return v;
    },

    /* ---- Ledger ---- */
    ledger() {
      const v = el(`<div class="view">
        <div class="section-head"><div><h2>Ledger</h2><span class="sub" id="ledgerCount"></span></div>
          <button class="btn btn-primary btn-sm" id="addTxn">＋ Add</button></div>
        <div class="filters">
          <input type="search" id="fSearch" placeholder="Search vendor or note…" />
          <select id="fType"><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
          <select id="fCat"><option value="">All categories</option>${[...new Set(bizTxns().map(t => t.category))].sort().map(c => `<option>${c}</option>`).join('')}</select>
        </div>
        <div class="card" style="padding:6px 14px"><div class="txn-list" id="ledgerList"></div></div>
      </div>`);
      const draw = () => {
        const s = $('#fSearch', v).value.toLowerCase();
        const ty = $('#fType', v).value, ct = $('#fCat', v).value;
        let list = bizTxns().filter(t =>
          (!ty || t.type === ty) && (!ct || t.category === ct) &&
          (!s || t.vendor.toLowerCase().includes(s) || (t.notes || '').toLowerCase().includes(s)));
        $('#ledgerCount', v).textContent = `${list.length} transaction${list.length === 1 ? '' : 's'}`;
        const host = $('#ledgerList', v);
        host.innerHTML = list.length ? list.map(t => txnRow(t, true)).join('')
          : `<div class="empty"><div class="em-ic">≣</div><h3>No matches</h3><p>Try clearing a filter.</p></div>`;
        $$('.txn[data-id]', host).forEach(row => row.onclick = () => openTxn(row.dataset.id));
      };
      ['#fSearch', '#fType', '#fCat'].forEach(sel => { const e = $(sel, v); e.oninput = draw; e.onchange = draw; });
      $('#addTxn', v).onclick = () => openTxn(null);
      queueMicrotask(draw);
      return v;
    },

    /* ---- Reports ---- */
    reports() {
      const txns = bizTxns();
      const series = monthlySeries(txns, 6);
      const cur = series[series.length - 1];
      const v = el(`<div class="view">
        <div class="card narrative">
          <div class="spark">✦</div>
          <div class="n-month">Monthly P&amp;L · ${MONTHS[new Date('2026-07-20').getMonth()]} 2026</div>
          <div class="n-head"><span class="n-badge">✦ AI Narrative</span></div>
          <p>${esc(narrative(txns))}</p>
        </div>
        <div class="kpis" style="margin:14px 0 4px">
          <div class="kpi"><div class="kpi-label">Total income</div><div class="kpi-val pos">${fmt(cur.income)}</div></div>
          <div class="kpi"><div class="kpi-label">Total expenses</div><div class="kpi-val">${fmt(cur.expense)}</div></div>
          <div class="kpi"><div class="kpi-label">Net profit</div><div class="kpi-val ${cur.net >= 0 ? 'pos' : 'neg'}">${fmt(cur.net)}</div></div>
          <div class="kpi"><div class="kpi-label">Profit margin</div><div class="kpi-val">${cur.income ? Math.round(cur.net / cur.income * 100) : 0}%</div></div>
        </div>
        <div class="card">
          <div class="section-head"><h2>6-month trend</h2><span class="sub">income vs expense</span></div>
          <div class="chart-wrap">${lineChart(series)}</div>
        </div>
        <div class="card">
          <div class="section-head"><h2>Category breakdown</h2><span class="sub">this month</span></div>
          ${donut(cur.byCat)}
        </div>
        <div class="card" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
          <div><strong>Monthly P&amp;L report</strong><div class="hint">Shareable summary for tax prep or your accountant.</div></div>
          <button class="btn btn-primary" id="exportPdf">⬇ Download PDF</button>
        </div>
      </div>`);
      $('#exportPdf', v).onclick = () => exportReport(txns, cur);
      return v;
    },

    /* ---- Ask AI ---- */
    ask() {
      const bizId = DB.activeBiz;
      DB.chats[bizId] ||= [{ role: 'ai', text: `Hi! I'm your finance assistant for ${state().name}. Ask me anything about your money — I'll answer in plain English.` }];
      const v = el(`<div class="view">
        <div class="suggested" id="suggested">
          ${['How much did I spend on supplies last quarter?', "What's my biggest expense this month?", 'Am I spending more than earlier this year?', 'How much profit did I make?'].map(q => `<button>${esc(q)}</button>`).join('')}
        </div>
        <div class="chat" id="chat"></div>
        <form class="ask-bar" id="askForm">
          <input id="askInput" placeholder="Ask about your finances…" autocomplete="off" />
          <button class="btn btn-primary" type="submit">Ask</button>
        </form>
      </div>`);
      const chat = $('#chat', v);
      const drawChat = () => {
        chat.innerHTML = DB.chats[bizId].map(m => m.role === 'user'
          ? `<div class="chat-msg user">${esc(m.text)}</div>`
          : `<div class="chat-msg ai"><div class="ai-tag">✦ LedgerLite AI</div>${esc(m.text)}</div>`).join('');
        chat.scrollTop = chat.scrollHeight;
      };
      const ask = async (q) => {
        DB.chats[bizId].push({ role: 'user', text: q }); save(); drawChat();
        const typing = el(`<div class="chat-msg ai"><div class="ai-tag">✦ LedgerLite AI</div><span class="typing"><span></span><span></span><span></span></span></div>`);
        chat.appendChild(typing); chat.scrollTop = chat.scrollHeight;
        await wait(650 + Math.random() * 500);
        DB.chats[bizId].push({ role: 'ai', text: answer(q, bizTxns()) }); save(); drawChat();
      };
      $('#askForm', v).onsubmit = (e) => { e.preventDefault(); const i = $('#askInput', v); const q = i.value.trim(); if (!q) return; i.value = ''; ask(q); };
      $$('#suggested button', v).forEach(b => b.onclick = () => ask(b.textContent));
      queueMicrotask(drawChat);
      return v;
    }
  };

  /* ---------- Scan flow rendering ---------- */
  function renderScanCamera(root) {
    if (!root) return;
    root.innerHTML = `
      <div class="camera" id="cam">
        <div class="frame"><span class="corner c-tl"></span><span class="corner c-tr"></span><span class="corner c-bl"></span><span class="corner c-br"></span></div>
        <div class="mock-receipt"><i class="t"></i><i></i><i class="s"></i><i></i><i class="s"></i><i></i><i class="t s"></i></div>
        <div class="scanline"></div>
        <div class="cam-hint">Align the receipt within the frame</div>
      </div>
      <div class="shutter-row">
        <button class="mini-btn" id="galleryBtn"><span class="mb-ic">🖼️</span>Gallery</button>
        <button class="shutter" id="shutter" aria-label="Capture"><i></i></button>
        <button class="mini-btn" id="manualBtn"><span class="mb-ic">✎</span>Manual</button>
      </div>
      <p class="hint" style="text-align:center;max-width:320px;margin:6px auto 0">Snap a receipt (this demo simulates the camera + OCR). It's read, categorised, and dropped into your review queue.</p>`;
    $('#shutter', root).onclick = () => runScanPipeline(root);
    $('#galleryBtn', root).onclick = () => runScanPipeline(root);
    $('#manualBtn', root).onclick = () => { openTxn(null); };
  }

  async function runScanPipeline(root) {
    const cam = $('#cam', root);
    cam.classList.add('scanning');
    // Processing UI
    root.innerHTML = `<div class="proc">
      <div class="ring">${spinner()}</div>
      <div class="proc-steps" id="steps">
        <div class="pstep" data-s="0"><span class="ps-ic">1</span><b>Reading receipt…</b></div>
        <div class="pstep" data-s="1"><span class="ps-ic">2</span><b>Extracting vendor, date &amp; total…</b></div>
        <div class="pstep" data-s="2"><span class="ps-ic">3</span><b>Categorising…</b></div>
        <div class="pstep" data-s="3"><span class="ps-ic">4</span><b>Done!</b></div>
      </div></div>`;
    const steps = $$('.pstep', root);
    for (let i = 0; i < steps.length; i++) {
      steps.forEach((s, j) => { s.classList.toggle('active', j === i); if (j < i) { s.classList.add('done'); s.querySelector('.ps-ic').textContent = '✓'; } });
      await wait(700 + Math.random() * 350);
    }
    steps.forEach(s => { s.classList.remove('active'); s.classList.add('done'); s.querySelector('.ps-ic').textContent = '✓'; });
    const item = makeReviewItem(DB.activeBiz, state().currency);
    DB.queue.unshift(item); save(); refreshBadges();
    await wait(280);
    // Success screen
    root.innerHTML = `<div class="success">
      <div class="check-badge"><svg viewBox="0 0 100 100"><circle class="check-circle" cx="50" cy="50" r="46"/><path class="check-mark" d="M28 52 L44 68 L74 34"/></svg></div>
      <h2 style="margin:0 0 4px">Snapped &amp; booked!</h2>
      <p class="hint">Here's what I read — added to your review queue.</p>
      <div class="card extracted" style="text-align:left">
        <div class="review-fields">
          ${field('Vendor', item.vendor, item.conf.vendor)}
          ${field('Total', fmt2(item.amount, item.currency), item.conf.amount)}
          ${field('Date', dateStr(item.date), item.conf.date)}
          ${field('Category', item.category, item.conf.category)}
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
        <button class="btn btn-primary btn-block" data-view="review" style="flex:1;min-width:150px">Review it now</button>
        <button class="btn btn-ghost" id="scanAgain" style="flex:1;min-width:150px">Scan another</button>
      </div>
    </div>`;
    toast('Receipt processed — added to review queue', 'good');
    const again = $('#scanAgain', root); if (again) again.onclick = () => renderScanCamera(root);
  }
  const field = (label, val, conf) => {
    const low = conf < 0.8;
    return `<div class="rf ${low ? 'low' : ''}"><label>${label} <span class="conf ${low ? 'lo' : 'hi'}">${Math.round(conf * 100)}%</span></label><div class="v">${esc(val)}</div></div>`;
  };

  /* ---------- Review card ---------- */
  function reviewCard(item) {
    const lowFields = Object.entries(item.conf).filter(([, c]) => c < 0.8).map(([k]) => k);
    const card = el(`<div class="card review-card">
      <div class="review-top">
        <div class="receipt-thumb">
          <div class="r-lines">${'<i></i>'.repeat(6)}</div>
          <span>RECEIPT</span>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="font-size:15px">${esc(item.vendor)}</strong>
            ${lowFields.length ? `<span class="pill amber">${lowFields.length} to check</span>` : `<span class="pill green">High confidence</span>`}
          </div>
          <div class="review-fields">
            <div class="rf"><label>Vendor</label><input data-f="vendor" value="${esc(item.vendor)}"/></div>
            <div class="rf ${item.conf.amount < 0.8 ? 'low' : ''}"><label>Amount ${confTag(item.conf.amount)}</label><input data-f="amount" type="number" step="0.01" value="${item.amount}"/></div>
            <div class="rf ${item.conf.date < 0.8 ? 'low' : ''}"><label>Date ${confTag(item.conf.date)}</label><input data-f="date" type="date" value="${item.date}"/></div>
            <div class="rf"><label>Category</label><select data-f="category">${EXP_CATS.map(c => `<option ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
            <div class="rf"><label>Type</label><select data-f="type"><option value="expense" ${item.type === 'expense' ? 'selected' : ''}>Expense</option><option value="income" ${item.type === 'income' ? 'selected' : ''}>Income</option></select></div>
            <div class="rf"><label>Tax</label><input data-f="tax" type="number" step="0.01" value="${item.tax}"/></div>
          </div>
        </div>
      </div>
      <div class="review-actions">
        <button class="btn btn-primary" data-act="approve">✓ Approve to ledger</button>
        <button class="btn btn-ghost" data-act="reject">Reject</button>
      </div>
    </div>`);
    card.querySelector('[data-act="approve"]').onclick = () => {
      $$('[data-f]', card).forEach(inp => {
        const f = inp.dataset.f;
        item[f] = (f === 'amount' || f === 'tax') ? parseFloat(inp.value) || 0 : inp.value;
      });
      approveReview(item.id, false, item);
      toast('Approved — moved to ledger', 'good');
      render('review');
    };
    card.querySelector('[data-act="reject"]').onclick = () => {
      DB.queue = DB.queue.filter(i => i.id !== item.id); save(); refreshBadges();
      toast('Receipt rejected');
      render('review');
    };
    return card;
  }
  const confTag = (c) => `<span class="conf ${c < 0.8 ? 'lo' : 'hi'}">${Math.round(c * 100)}%</span>`;

  function approveReview(id, silent, edited) {
    const item = edited || DB.queue.find(i => i.id === id);
    if (!item) return;
    DB.txns.unshift({
      id: uid(), businessId: item.businessId, type: item.type || 'expense',
      category: item.category, vendor: item.vendor, amount: item.amount, tax: item.tax || 0,
      currency: item.currency, date: item.date, confidence: Math.min(...Object.values(item.conf)),
      recurring: false, notes: '', receipt: true
    });
    DB.queue = DB.queue.filter(i => i.id !== id);
    save(); refreshBadges();
  }

  /* ---------- Transaction editor (modal) ---------- */
  function openTxn(id) {
    const t = id ? bizTxns().find(x => x.id === id) : null;
    const isNew = !t;
    const model = t || { type: 'expense', category: 'Supplies', vendor: '', amount: '', tax: 0, date: '2026-07-20', notes: '', currency: state().currency };
    const cats = [...EXP_CATS, 'Sales'];
    const modal = el(`<div class="scrim" style="display:grid;place-items:end center;padding:0">
      <div class="card" style="width:100%;max-width:520px;margin:0;border-radius:18px 18px 0 0;max-height:92dvh;overflow:auto" role="dialog" aria-modal="true">
        <div class="section-head"><h2>${isNew ? 'Add transaction' : 'Edit transaction'}</h2><button class="icon-btn" id="closeM">✕</button></div>
        <div class="grid-2">
          <div class="field"><label>Type</label><select id="mType"><option value="expense" ${model.type === 'expense' ? 'selected' : ''}>Expense</option><option value="income" ${model.type === 'income' ? 'selected' : ''}>Income</option></select></div>
          <div class="field"><label>Date</label><input id="mDate" type="date" value="${model.date}"/></div>
        </div>
        <div class="field"><label>Vendor / source</label><input id="mVendor" value="${esc(model.vendor)}" placeholder="e.g. Office Depot"/></div>
        <div class="grid-2">
          <div class="field"><label>Category</label><select id="mCat">${cats.map(c => `<option ${c === model.category ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="field"><label>Amount (${CUR[model.currency] || '$'})</label><input id="mAmount" type="number" step="0.01" value="${model.amount}" placeholder="0.00"/></div>
        </div>
        <div class="field"><label>Notes</label><input id="mNotes" value="${esc(model.notes || '')}" placeholder="Optional"/></div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <button class="btn btn-primary btn-block" id="saveM">${isNew ? 'Add transaction' : 'Save changes'}</button>
          ${isNew ? '' : '<button class="btn btn-danger" id="delM">Delete</button>'}
        </div>
      </div></div>`);
    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) close(); };
    $('#closeM', modal).onclick = close;
    $('#saveM', modal).onclick = () => {
      const amt = parseFloat($('#mAmount', modal).value);
      const vendor = $('#mVendor', modal).value.trim();
      if (!vendor || !amt) { toast('Add a vendor and amount'); return; }
      const data = { type: $('#mType', modal).value, date: $('#mDate', modal).value, vendor,
        category: $('#mCat', modal).value, amount: amt, notes: $('#mNotes', modal).value.trim() };
      if (isNew) DB.txns.unshift({ id: uid(), businessId: DB.activeBiz, tax: 0, currency: state().currency, confidence: 1, recurring: false, receipt: false, ...data });
      else Object.assign(t, data);
      save(); close(); toast(isNew ? 'Transaction added' : 'Transaction saved', 'good'); render(currentView);
    };
    const del = $('#delM', modal);
    if (del) del.onclick = () => { DB.txns = DB.txns.filter(x => x.id !== id); save(); close(); toast('Transaction deleted'); render(currentView); };
  }

  /* ---------- Row + chart builders ---------- */
  function txnRow(t, clickable) {
    return `<div class="txn" ${clickable ? `data-id="${t.id}" style="cursor:pointer"` : ''}>
      <div class="txn-ic ${t.type === 'income' ? 'income' : ''}">${catIcon(t.category)}</div>
      <div class="txn-main">
        <div class="txn-vendor">${esc(t.vendor)}</div>
        <div class="txn-meta"><span>${dateStr(t.date)}</span>·<span>${esc(t.category)}</span>${t.recurring ? '·<span class="pill navy" style="padding:1px 7px">recurring</span>' : ''}</div>
      </div>
      <div class="txn-amt ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount, t.currency)}</div>
    </div>`;
  }

  function barChart(series) {
    const W = Math.max(320, series.length * 92), H = 200, pad = 28, bw = 18, gap = 8;
    const max = Math.max(1, ...series.map(s => Math.max(s.income, s.expense)));
    const colW = (W - pad * 2) / series.length;
    const y = (v) => H - pad - (v / max) * (H - pad * 2);
    let bars = '', labels = '';
    series.forEach((s, i) => {
      const cx = pad + colW * i + colW / 2;
      const x1 = cx - bw - gap / 2, x2 = cx + gap / 2;
      bars += `<rect x="${x1}" y="${y(s.income)}" width="${bw}" height="${H - pad - y(s.income)}" rx="4" fill="var(--green)"><title>${s.label}: ${fmt(s.income)} in</title></rect>`;
      bars += `<rect x="${x2}" y="${y(s.expense)}" width="${bw}" height="${H - pad - y(s.expense)}" rx="4" fill="var(--ink)"><title>${s.label}: ${fmt(s.expense)} out</title></rect>`;
      labels += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="600">${s.label}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Revenue vs expenses bar chart">
      <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="var(--line-2)"/>${bars}${labels}</svg>`;
  }

  function lineChart(series) {
    const W = Math.max(340, series.length * 96), H = 210, pad = 30;
    const max = Math.max(1, ...series.map(s => Math.max(s.income, s.expense)));
    const x = (i) => pad + i * ((W - pad * 2) / (series.length - 1 || 1));
    const y = (v) => H - pad - (v / max) * (H - pad * 2);
    const path = (key, color) => {
      const d = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(s[key]).toFixed(1)}`).join(' ');
      const dots = series.map((s, i) => `<circle cx="${x(i)}" cy="${y(s[key])}" r="3.5" fill="${color}"><title>${s.label}: ${fmt(s[key])}</title></circle>`).join('');
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>${dots}`;
    };
    const grid = [0, .5, 1].map(f => `<line x1="${pad}" y1="${y(max * f)}" x2="${W - pad}" y2="${y(max * f)}" stroke="var(--line)"/>`).join('');
    const labels = series.map((s, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="600">${s.label}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Income and expense trend">
      ${grid}${path('income', 'var(--green)')}${path('expense', 'var(--ink)')}${labels}</svg>
      <div class="legend"><span class="li"><span class="dot" style="background:var(--green)"></span>Income</span><span class="li"><span class="dot" style="background:var(--ink)"></span>Expenses</span></div>`;
  }

  function donut(byCat) {
    const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((a, [, v]) => a + v, 0);
    if (!total) return `<div class="empty" style="padding:24px"><div class="em-ic">◔</div><p>No expenses this month yet.</p></div>`;
    const colors = ['#12A150', '#1E3A5F', '#E8A33D', '#4A90D9', '#8E5FD9', '#D64545', '#2FB89A', '#B4791E', '#7A8699', '#0C7A3C'];
    const R = 60, C = 2 * Math.PI * R, cx = 80, cy = 80;
    let off = 0, arcs = '';
    entries.forEach(([, v], i) => {
      const frac = v / total, len = C * frac;
      arcs += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="22" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
      off += len;
    });
    const legend = entries.map(([c, v], i) =>
      `<span class="li"><span class="dot" style="background:${colors[i % colors.length]}"></span>${esc(c)} <b>${fmt(v)}</b> <span class="hint">(${Math.round(v / total * 100)}%)</span></span>`).join('');
    return `<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <svg viewBox="0 0 160 160" width="160" height="160" style="flex:none" role="img" aria-label="Category breakdown">
        ${arcs}<text x="80" y="76" text-anchor="middle" font-size="12" fill="var(--muted)" font-weight="600">Total</text>
        <text x="80" y="94" text-anchor="middle" font-size="17" fill="var(--ink)" font-weight="800">${fmt(total)}</text></svg>
      <div class="legend" style="flex:1;min-width:180px">${legend}</div></div>`;
  }
  const spinner = () => `<svg viewBox="0 0 50 50" width="96" height="96"><circle cx="25" cy="25" r="20" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="25" cy="25" r="20" fill="none" stroke="var(--green)" stroke-width="5" stroke-linecap="round" stroke-dasharray="90 126"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite"/></circle></svg>`;

  /* ---------- Count-up animation ---------- */
  function countUp(root) {
    $$('[data-count]', root).forEach(node => {
      const target = parseFloat(node.dataset.count) || 0;
      const plain = node.dataset.plain === '1';
      const dur = 900, start = performance.now();
      const tick = (now) => {
        const p = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        node.textContent = plain ? Math.round(val).toString() : fmt(val);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- PDF-ish export (printable report) ---------- */
  function exportReport(txns, cur) {
    const w = window.open('', '_blank');
    if (!w) { toast('Allow pop-ups to export the report'); return; }
    const rows = Object.entries(cur.byCat).sort((a, b) => b[1] - a[1])
      .map(([c, v]) => `<tr><td>${c}</td><td style="text-align:right">${fmt(v)}</td></tr>`).join('');
    w.document.write(`<!doctype html><html><head><title>LedgerLite P&L — ${state().name}</title>
      <style>body{font-family:Inter,Arial,sans-serif;color:#1E3A5F;max-width:640px;margin:32px auto;padding:0 20px}
      h1{color:#12A150;margin:0} .muted{color:#7A8699} table{width:100%;border-collapse:collapse;margin-top:14px}
      td,th{padding:9px 6px;border-bottom:1px solid #eee;text-align:left} .big{font-size:26px;font-weight:800}
      .note{background:#F4FBF6;border:1px solid #E6F5EC;border-radius:12px;padding:16px;margin:18px 0;line-height:1.6}
      .kpi{display:flex;gap:24px;margin:16px 0}</style></head><body>
      <h1>LedgerLite</h1><div class="muted">Monthly P&L · ${state().name} · ${MONTHS[new Date('2026-07-20').getMonth()]} 2026</div>
      <div class="note"><strong>✦ AI Summary</strong><br/>${esc(narrative(txns))}</div>
      <div class="kpi"><div><div class="muted">Income</div><div class="big" style="color:#0C7A3C">${fmt(cur.income)}</div></div>
      <div><div class="muted">Expenses</div><div class="big">${fmt(cur.expense)}</div></div>
      <div><div class="muted">Net profit</div><div class="big">${fmt(cur.net)}</div></div></div>
      <h3>Expense breakdown</h3><table><tr><th>Category</th><th style="text-align:right">Amount</th></tr>${rows}</table>
      <p class="muted" style="margin-top:28px">Generated by LedgerLite · Idea & concept by Swayam Parikh</p>
      <script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
    w.document.close();
    toast('Report opened — use your browser to save as PDF', 'good');
  }

  /* ---------- Router ---------- */
  let currentView = 'dashboard';
  function render(view) {
    currentView = view;
    content.innerHTML = '';
    content.appendChild(Views[view]());
    content.scrollTop = 0; window.scrollTo(0, 0);
    $('#topbarTitle').textContent = TITLES[view];
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    closeDrawer();
    refreshBadges();
  }

  function refreshBadges() {
    const n = bizQueue().length;
    ['#reviewBadge', '#reviewBadgeMobile'].forEach(sel => {
      const e = $(sel); if (!e) return; e.textContent = n; e.dataset.zero = n === 0 ? '1' : '0';
    });
  }

  /* ---------- Business switcher ---------- */
  function fillBizSelectors() {
    const opts = DB.businesses.map(b => `<option value="${b.id}" ${b.id === DB.activeBiz ? 'selected' : ''}>${esc(b.name)}</option>`).join('');
    ['#bizSelect', '#bizSelectMobile'].forEach(sel => { const e = $(sel); if (e) e.innerHTML = opts; });
  }
  function switchBiz(id) {
    DB.activeBiz = id; save(); fillBizSelectors(); render(currentView);
  }

  /* ---------- Drawer (mobile menu) ---------- */
  const sidebar = $('#sidebar'), scrim = $('#scrim');
  function openDrawer() { sidebar.classList.add('open'); scrim.hidden = false; }
  function closeDrawer() { sidebar.classList.remove('open'); scrim.hidden = true; }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg, kind) {
    const host = $('#toastHost');
    const t = el(`<div class="toast ${kind === 'good' ? 'good' : ''}"><span class="t-ic">${kind === 'good' ? '✓' : 'ℹ'}</span>${esc(msg)}</div>`);
    host.appendChild(t);
    clearTimeout(toastTimer);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 320); }, 2600);
  }

  /* ---------- Global event wiring ---------- */
  function wire() {
    document.body.addEventListener('click', (e) => {
      const nav = e.target.closest('[data-view]');
      if (nav) { e.preventDefault(); render(nav.dataset.view); }
    });
    $('#menuBtn').onclick = openDrawer;
    scrim.onclick = closeDrawer;
    $('#bizSelect').onchange = (e) => switchBiz(e.target.value);
    $('#bizSelectMobile').onchange = (e) => switchBiz(e.target.value);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeDrawer(); $$('body > .scrim').forEach(m => m.remove()); }
    });
  }

  /* ---------- Init ---------- */
  boot();
  fillBizSelectors();
  wire();
  render('dashboard');
})();
