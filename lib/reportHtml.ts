import { Profile, CATEGORY_LABEL } from './store';
import { MonthlyReport, clientLabel } from './report';
import { money, num, monthLabel, longDateYear, todayISO } from './format';

// Builds a clean, printable HTML document for the month report. expo-print
// renders this to PDF. Styling is intentionally plain so it reads as a
// business document a staffing house would accept.

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function buildReportHtml(r: MonthlyReport, profile: Profile): string {
  const preparedBy = profile.name?.trim() ? esc(profile.name.trim()) : '';

  const clientBlocks = r.clients
    .map((c) => {
      const catRows = c.reimbursableByCategory
        .map(
          (cat) => `
            <tr class="sub">
              <td>${esc(CATEGORY_LABEL[cat.category])}</td>
              <td class="amt">${money(cat.amount)}</td>
            </tr>`
        )
        .join('');

      return `
        <section class="client">
          <div class="client-head">
            <h2>${esc(clientLabel(c.client))}</h2>
            <div class="invoice">${money(c.invoiceTotal)}<span class="cap">invoice total</span></div>
          </div>
          <table>
            <tbody>
              <tr><td>Days worked</td><td class="amt">${c.workedDays}${c.perDiemDays ? ` (${c.perDiemDays} per diem)` : ''}</td></tr>
              <tr><td>Day-rate income</td><td class="amt">${money(c.income)}</td></tr>
              ${c.perDiem > 0 ? `<tr><td>Per diem M&amp;IE (${c.perDiemDays} days)</td><td class="amt">${money(c.perDiem)}</td></tr>` : ''}
              ${c.reimbursable > 0 ? `<tr class="head"><td>Reimbursable</td><td class="amt">${money(c.reimbursable)}</td></tr>${catRows}` : ''}
              ${c.miles > 0 ? `<tr><td>Mileage</td><td class="amt">${num(c.miles)} mi (${money(c.mileageDeduction)} est.)</td></tr>` : ''}
              ${c.deductible > 0 ? `<tr class="muted"><td>Your deductions (not billed)</td><td class="amt">${money(c.deductible)}</td></tr>` : ''}
            </tbody>
          </table>
        </section>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1F1F1D; margin: 0; padding: 40px; font-size: 13px; line-height: 1.5; }
  .doc-title { font-size: 22px; font-weight: 600; margin: 0; }
  .doc-sub { color: #6b6b66; margin: 4px 0 2px; }
  .doc-dates { color: #6b6b66; font-size: 12px; }
  hr { border: none; border-top: 1px solid #e4e4df; margin: 20px 0; }
  .client { margin-bottom: 22px; page-break-inside: avoid; }
  .client-head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #e4e4df; padding-bottom: 6px; }
  .client-head h2 { font-size: 15px; font-weight: 600; margin: 0; }
  .invoice { font-size: 18px; font-weight: 700; color: #185FA5; text-align: right; }
  .invoice .cap { display: block; font-size: 10px; font-weight: 400; color: #6b6b66; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  td { padding: 4px 0; }
  td.amt { text-align: right; white-space: nowrap; }
  tr.head td { font-weight: 600; padding-top: 8px; }
  tr.sub td { color: #6b6b66; font-size: 12px; padding-left: 16px; }
  tr.muted td { color: #6b6b66; }
  .totals { margin-top: 8px; background: #f5f5f2; border-radius: 8px; padding: 14px 16px; page-break-inside: avoid; }
  .totals h3 { font-size: 12px; color: #6b6b66; font-weight: 600; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.04em; }
  .totals tr.strong td { font-weight: 700; }
  .foot { margin-top: 26px; color: #9a9a93; font-size: 10px; }
</style>
</head>
<body>
  <h1 class="doc-title">Expense &amp; income report</h1>
  <div class="doc-sub">${monthLabel(r.year, r.month)}${preparedBy ? ` · ${preparedBy}` : ''}</div>
  <div class="doc-dates">Billed ${longDateYear(r.billingDate)} &nbsp;·&nbsp; Expected pay ${longDateYear(r.expectedPayDate)}</div>
  <hr />

  ${clientBlocks || '<p>No activity logged for this month.</p>'}

  <div class="totals">
    <h3>Totals</h3>
    <table>
      <tbody>
        <tr><td>Day-rate income</td><td class="amt">${money(r.totals.income)}</td></tr>
        ${r.totals.perDiem > 0 ? `<tr><td>Per diem M&amp;IE</td><td class="amt">${money(r.totals.perDiem)}</td></tr>` : ''}
        <tr><td>Reimbursable</td><td class="amt">${money(r.totals.reimbursable)}</td></tr>
        <tr class="strong"><td>Invoice total</td><td class="amt">${money(r.totals.invoiceTotal)}</td></tr>
        <tr class="muted"><td>Your deductions</td><td class="amt">${money(r.totals.deductible)}</td></tr>
        <tr class="muted"><td>Mileage</td><td class="amt">${num(r.totals.miles)} mi (${money(r.totals.mileageDeduction)})</td></tr>
      </tbody>
    </table>
  </div>

  <div class="foot">Generated ${longDateYear(todayISO())} by HitchWell. Figures are estimates for planning and billing, not tax advice.</div>
</body>
</html>`;
}
