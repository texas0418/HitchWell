import { DayEntry, Expense, Mileage, Profile, ExpenseCategory, CATEGORY_LABEL } from './store';
import { fromISO, monthBounds, addDays, monthLabel, longDateYear } from './format';
import { money, num } from './format';

// Builds a month report grouped by client. For a monthly biller, the month is
// the pay period. Income is day-rate only. Invoice total is what the staffing
// house owes: day-rate income plus reimbursable costs. Deductible costs are the
// contractor's own and are reported separately, not invoiced.

export type CategoryAmount = { category: ExpenseCategory; amount: number };

export type ClientReport = {
  client: string;            // '' means unassigned
  workedDays: number;        // days that are not 'off'
  perDiemDays: number;
  perDiem: number;           // M&IE dollars for the month
  income: number;
  miles: number;
  mileageDeduction: number;
  reimbursable: number;
  reimbursableByCategory: CategoryAmount[];
  deductible: number;
  invoiceTotal: number;      // income + reimbursable
};

export type MonthlyReport = {
  year: number;
  month: number;
  billingDate: string;       // last day of the month
  expectedPayDate: string;   // billingDate + payment terms
  clients: ClientReport[];
  totals: {
    income: number;
    reimbursable: number;
    deductible: number;
    perDiem: number;
    miles: number;
    mileageDeduction: number;
    invoiceTotal: number;
  };
};

const inMonth = (iso: string, year: number, month: number) => {
  const d = fromISO(iso);
  return d.getFullYear() === year && d.getMonth() === month;
};

export function buildMonthlyReport(
  dayEntries: DayEntry[],
  expenses: Expense[],
  mileage: Mileage[],
  profile: Profile,
  year: number,
  month: number
): MonthlyReport {
  const days = dayEntries.filter((d) => inMonth(d.date, year, month));
  const exps = expenses.filter((e) => inMonth(e.date, year, month));
  const miles = mileage.filter((m) => inMonth(m.date, year, month));

  const keys = new Set<string>();
  days.forEach((d) => keys.add(d.client ?? ''));
  exps.forEach((e) => keys.add(e.client ?? ''));
  miles.forEach((m) => keys.add(m.client ?? ''));

  const rate = profile.mileageRate || 0;

  const clients: ClientReport[] = Array.from(keys).map((key) => {
    const cd = days.filter((d) => (d.client ?? '') === key);
    const ce = exps.filter((e) => (e.client ?? '') === key);
    const cm = miles.filter((m) => (m.client ?? '') === key);

    const income = cd.reduce((s, d) => s + (d.rate || 0), 0);
    const workedDays = cd.filter((d) => d.type !== 'off').length;
    const perDiemDays = cd.filter((d) => d.perDiem).length;
    const perDiem = cd
      .filter((d) => d.perDiem)
      .reduce((s, d) => s + (d.perDiemAmount ?? profile.perDiemMie ?? 0), 0);
    const milesTotal = cm.reduce((s, m) => s + (m.miles || 0), 0);

    const reimb = ce.filter((e) => e.reimbursable);
    const reimbursable = reimb.reduce((s, e) => s + (e.amount || 0), 0);
    const deductible = ce.filter((e) => !e.reimbursable).reduce((s, e) => s + (e.amount || 0), 0);

    const catMap: Record<string, number> = {};
    reimb.forEach((e) => (catMap[e.category] = (catMap[e.category] || 0) + (e.amount || 0)));
    const reimbursableByCategory = Object.entries(catMap)
      .map(([category, amount]) => ({ category: category as ExpenseCategory, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      client: key,
      workedDays,
      perDiemDays,
      perDiem,
      income,
      miles: milesTotal,
      mileageDeduction: milesTotal * rate,
      reimbursable,
      reimbursableByCategory,
      deductible,
      invoiceTotal: income + reimbursable,
    };
  });

  // Highest invoice first; unassigned bucket always last.
  clients.sort((a, b) => {
    if (a.client === '' && b.client !== '') return 1;
    if (b.client === '' && a.client !== '') return -1;
    return b.invoiceTotal - a.invoiceTotal;
  });

  const totals = clients.reduce(
    (t, c) => ({
      income: t.income + c.income,
      reimbursable: t.reimbursable + c.reimbursable,
      deductible: t.deductible + c.deductible,
      perDiem: t.perDiem + c.perDiem,
      miles: t.miles + c.miles,
      mileageDeduction: t.mileageDeduction + c.mileageDeduction,
      invoiceTotal: t.invoiceTotal + c.invoiceTotal,
    }),
    { income: 0, reimbursable: 0, deductible: 0, perDiem: 0, miles: 0, mileageDeduction: 0, invoiceTotal: 0 }
  );

  const { end } = monthBounds(year, month);
  return {
    year,
    month,
    billingDate: end,
    expectedPayDate: addDays(end, profile.paymentTermsDays || 0),
    clients,
    totals,
  };
}

export function clientLabel(client: string): string {
  return client || 'Unassigned';
}

// Plain-text version for the share sheet. PDF export comes later.
export function buildReportText(r: MonthlyReport): string {
  const L: string[] = [];
  L.push(`HitchWell — ${monthLabel(r.year, r.month)}`);
  L.push(`Billed ${longDateYear(r.billingDate)} · Expected pay ${longDateYear(r.expectedPayDate)}`);
  L.push('');

  for (const c of r.clients) {
    L.push(clientLabel(c.client));
    L.push(`  Days worked: ${c.workedDays}  (per diem: ${c.perDiemDays})`);
    L.push(`  Day-rate income: ${money(c.income)}`);
    if (c.perDiem > 0) L.push(`  Per diem (M&IE): ${money(c.perDiem)} over ${c.perDiemDays} days`);
    if (c.reimbursable > 0) {
      L.push(`  Reimbursable: ${money(c.reimbursable)}`);
      for (const cat of c.reimbursableByCategory) {
        L.push(`    ${CATEGORY_LABEL[cat.category]}: ${money(cat.amount)}`);
      }
    }
    if (c.miles > 0) L.push(`  Mileage: ${num(c.miles)} mi (est. deduction ${money(c.mileageDeduction)})`);
    L.push(`  Invoice total: ${money(c.invoiceTotal)}`);
    if (c.deductible > 0) L.push(`  Your deductions (not billed): ${money(c.deductible)}`);
    L.push('');
  }

  L.push('TOTALS');
  L.push(`  Day-rate income: ${money(r.totals.income)}`);
  if (r.totals.perDiem > 0) L.push(`  Per diem (M&IE): ${money(r.totals.perDiem)}`);
  L.push(`  Reimbursable: ${money(r.totals.reimbursable)}`);
  L.push(`  Invoice total: ${money(r.totals.invoiceTotal)}`);
  L.push(`  Your deductions: ${money(r.totals.deductible)}`);
  L.push(`  Mileage: ${num(r.totals.miles)} mi (${money(r.totals.mileageDeduction)})`);
  return L.join('\n');
}
