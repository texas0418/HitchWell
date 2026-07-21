import * as FileSystem from 'expo-file-system/legacy';
import { Expense, CATEGORY_LABEL } from './store';
import { longDate, money } from './format';

// Reads receipt photos for a month's reimbursable expenses and returns them as
// base64 data URIs, grouped for the PDF appendix. Files that fail to read are
// skipped so one bad photo never blocks the report.

export type ReceiptItem = {
  client: string;       // '' = unassigned
  label: string;        // e.g. "Airfare · $420.00 · Jun 12"
  dataUri: string;
};

const mimeFor = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'png') return 'image/png';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  return 'image/jpeg';
};

export async function buildReceiptItems(
  expenses: Expense[],
  start: string,
  end: string
): Promise<ReceiptItem[]> {
  const withReceipts = expenses.filter((e) => e.receiptUri && e.date >= start && e.date <= end);
  const items: ReceiptItem[] = [];

  for (const e of withReceipts) {
    try {
      const b64 = await FileSystem.readAsStringAsync(e.receiptUri!, {
        encoding: FileSystem.EncodingType.Base64,
      });
      items.push({
        client: e.client ?? '',
        label: `${CATEGORY_LABEL[e.category]} · ${money(e.amount)} · ${longDate(e.date)}${e.reimbursable ? '' : ' · deduction'}`,
        dataUri: `data:${mimeFor(e.receiptUri!)};base64,${b64}`,
      });
    } catch {
      // unreadable/missing file; skip
    }
  }
  return items;
}
