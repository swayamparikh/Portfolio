'use client';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fmtMoney } from '@/lib/store';

const DONUT_COLORS = ['#12A150', '#1E3A5F', '#E8A33D', '#4A90D9', '#8E5FD9', '#D64545', '#2FB89A', '#B4791E', '#7A8699', '#0C7A3C'];

export function TrendBarChart({ series, currency }: { series: Array<{ label: string; income: number; expense: number }>; currency: string }) {
  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={series} barGap={4} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#ECEBE6" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#7A8699' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7A8699' }} tickFormatter={(v) => fmtMoney(v, currency)} width={64} />
          <Tooltip formatter={(v: number) => fmtMoney(v, currency)} contentStyle={{ borderRadius: 10, border: '1px solid #ECEBE6', fontSize: 13 }} />
          <Bar dataKey="income" name="Income" fill="#12A150" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({ series, currency }: { series: Array<{ label: string; income: number; expense: number }>; currency: string }) {
  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#ECEBE6" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#7A8699' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#7A8699' }} tickFormatter={(v) => fmtMoney(v, currency)} width={64} />
          <Tooltip formatter={(v: number) => fmtMoney(v, currency)} contentStyle={{ borderRadius: 10, border: '1px solid #ECEBE6', fontSize: 13 }} />
          <Line type="monotone" dataKey="income" name="Income" stroke="#12A150" strokeWidth={2.5} dot={{ r: 3.5 }} />
          <Line type="monotone" dataKey="expense" name="Expenses" stroke="#1E3A5F" strokeWidth={2.5} dot={{ r: 3.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({ byCategory, currency }: { byCategory: Record<string, number>; currency: string }) {
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  if (!total) return <div className="text-center py-8 text-muted"><div className="text-4xl opacity-50 mb-2">◔</div>No expenses this month yet.</div>;
  const data = entries.map(([name, value], i) => ({ name, value, color: DONUT_COLORS[i % DONUT_COLORS.length] }));
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="w-[160px] h-[160px] relative flex-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v: number) => fmtMoney(v, currency)} contentStyle={{ borderRadius: 10, border: '1px solid #ECEBE6', fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="text-[11px] text-muted font-semibold">Total</div>
            <div className="text-base font-extrabold">{fmtMoney(total, currency)}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-[180px] flex flex-wrap gap-x-4 gap-y-2">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-inksoft">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.name} <b className="text-ink font-bold">{fmtMoney(d.value, currency)}</b>
            <span className="text-muted font-medium">({Math.round((d.value / total) * 100)}%)</span>
          </span>
        ))}
      </div>
    </div>
  );
}
