/** Local-calendar date helpers. Avoid `Date#toISOString()` for "today" — it converts
 * through UTC, which shifts the date backward near midnight in positive-UTC-offset
 * timezones (e.g. IST) and can land on the wrong day or month. */
export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function currentMonthLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
