import { DayEntry, Expense, Mileage } from './store';

// Builds a simple CSV the user can hand to a CPA. Stub-level: shares as text.
// A proper file export (write + share a .csv) needs expo-file-system + expo-sharing.

export function buildCSV(dayEntries: DayEntry[], expenses: Expense[], mileage: Mileage[], year: number): string {
  const inYear = (iso: string) => Number(iso.slice(0, 4)) === year;
  const lines: string[] = [];

  lines.push(`HitchWell export,${year}`);
  lines.push('');
  lines.push('DAYS');
  lines.push('date,type,rate,state,per_diem,per_diem_mie,client,location');
  dayEntries
    .filter((d) => inYear(d.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((d) => lines.push(`${d.date},${d.type},${d.rate},${d.state},${d.perDiem ? 'yes' : 'no'},${d.perDiem ? (d.perDiemAmount ?? '') : ''},"${d.client ?? ''}","${d.location}"`));

  lines.push('');
  lines.push('EXPENSES');
  lines.push('date,category,reimbursable,amount,client,note');
  expenses
    .filter((e) => inYear(e.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((e) =>
      lines.push(`${e.date},${e.category},${e.reimbursable ? 'yes' : 'no'},${e.amount},"${e.client ?? ''}","${e.note ?? ''}"`)
    );

  lines.push('');
  lines.push('MILEAGE');
  lines.push('date,miles,client,purpose');
  mileage
    .filter((m) => inYear(m.date))
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((m) => lines.push(`${m.date},${m.miles},"${m.client ?? ''}","${m.purpose}"`));

  return lines.join('\n');
}
