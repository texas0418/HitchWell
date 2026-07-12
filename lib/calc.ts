import { Cert, DayEntry, Expense, Mileage, Profile } from './store';
import { fromISO, daysUntil } from './format';

// NOTE: every figure here is a simple rollup or a placeholder factor.
// None of this is a tax calculation. The set-aside is profile.taxSetAsidePct
// applied flat to income. Real per-diem rates (GSA), multi-state nonresident
// allocation, and 1099 estimated tax need a CPA-validated rules engine.

const yearOf = (iso: string) => fromISO(iso).getFullYear();

export function income(dayEntries: DayEntry[], year: number): number {
  return dayEntries.filter((d) => yearOf(d.date) === year).reduce((sum, d) => sum + (d.rate || 0), 0);
}

export function taxSetAside(incomeAmt: number, profile: Profile): number {
  return incomeAmt * (profile.taxSetAsidePct || 0);
}

export function netSoFar(incomeAmt: number, profile: Profile): number {
  return incomeAmt - taxSetAside(incomeAmt, profile);
}

export function daysOut(dayEntries: DayEntry[], year: number): number {
  return dayEntries.filter((d) => yearOf(d.date) === year && d.type !== 'off').length;
}

export function perDiemDays(dayEntries: DayEntry[], year: number): number {
  return dayEntries.filter((d) => yearOf(d.date) === year && d.perDiem).length;
}

export function perDiemTotal(dayEntries: DayEntry[], year: number, profile: Profile): number {
  return dayEntries
    .filter((d) => yearOf(d.date) === year && d.perDiem)
    .reduce((s, d) => s + (d.perDiemAmount ?? profile.perDiemMie ?? 0) + (d.lodgingAmount ?? 0), 0);
}

export function totalMileage(mileage: Mileage[], year: number): number {
  return mileage.filter((m) => yearOf(m.date) === year).reduce((s, m) => s + (m.miles || 0), 0);
}

export function mileageDeduction(miles: number, profile: Profile): number {
  return miles * (profile.mileageRate || 0);
}

export function expenseTotal(expenses: Expense[], year: number): number {
  return expenses.filter((e) => yearOf(e.date) === year).reduce((s, e) => s + (e.amount || 0), 0);
}

export function reimbursableTotal(expenses: Expense[], year: number): number {
  return expenses
    .filter((e) => yearOf(e.date) === year && e.reimbursable)
    .reduce((s, e) => s + (e.amount || 0), 0);
}

export function deductibleTotal(expenses: Expense[], year: number): number {
  return expenses
    .filter((e) => yearOf(e.date) === year && !e.reimbursable)
    .reduce((s, e) => s + (e.amount || 0), 0);
}

export type StateSlice = { state: string; amount: number; pct: number };

export function byState(dayEntries: DayEntry[], year: number): StateSlice[] {
  const totals: Record<string, number> = {};
  let grand = 0;
  for (const d of dayEntries) {
    if (yearOf(d.date) !== year) continue;
    if (!d.state) continue; // travel/off days have no state
    totals[d.state] = (totals[d.state] || 0) + (d.rate || 0);
    grand += d.rate || 0;
  }
  return Object.entries(totals)
    .map(([state, amount]) => ({ state, amount, pct: grand ? (amount / grand) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export type CertStatus = 'ok' | 'soon' | 'expired';

export function certStatus(c: Cert): { days: number; status: CertStatus } {
  const days = daysUntil(c.expiry);
  let status: CertStatus = 'ok';
  if (days < 0) status = 'expired';
  else if (days <= 60) status = 'soon';
  return { days, status };
}
