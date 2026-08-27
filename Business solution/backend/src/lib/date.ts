/** Local-calendar 'YYYY-MM-01' for the month `offset` months before now — avoids the
 * classic `new Date(y, m, 1).toISOString()` bug where positive-UTC-offset timezones
 * (e.g. IST) get shifted back a day at local midnight, landing on the wrong month. */
export function monthStartOffset(offset: number, from = new Date()): string {
  const y = from.getFullYear();
  const m = from.getMonth() - offset;
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function currentMonthKey(from = new Date()): string {
  return `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}`;
}
