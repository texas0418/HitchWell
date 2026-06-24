// Display formatting helpers. Always round before showing.

export function money(n: number): string {
  const v = Math.round(n || 0);
  return '$' + v.toLocaleString('en-US');
}

export function num(n: number): string {
  return Math.round(n || 0).toLocaleString('en-US');
}

export function pct(n: number): string {
  return Math.round(n || 0) + '%';
}

// ISO yyyy-mm-dd helpers (local, no time component).
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function dow(iso: string): string {
  return DOW[fromISO(iso).getDay()];
}

export function dayNum(iso: string): string {
  return String(fromISO(iso).getDate());
}

export function monthName(monthIndex: number): string {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][monthIndex];
}

export function longDate(iso: string): string {
  const d = fromISO(iso);
  return `${DOW[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function daysUntil(iso: string): number {
  const today = fromISO(todayISO());
  const target = fromISO(iso);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

// Month helpers for period reports.
export function monthBounds(year: number, month: number): { start: string; end: string } {
  const start = toISODate(new Date(year, month, 1));
  const end = toISODate(new Date(year, month + 1, 0)); // day 0 of next month = last day
  return { start, end };
}

export function addMonths(year: number, month: number, n: number): { year: number; month: number } {
  const d = new Date(year, month + n, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function monthLabel(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

// "Jun 14, 2026" style, with year, for billing and pay dates.
export function longDateYear(iso: string): string {
  const d = fromISO(iso);
  return `${MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
