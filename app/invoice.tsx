import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme, AppColors } from '../theme/colors';
import { AmountText } from '../components/AmountText';
import { useStore, CATEGORY_LABEL, DayType } from '../lib/store';
import { buildInvoiceHtml, InvoiceLine } from '../lib/invoiceHtml';
import { buildReceiptItems } from '../lib/receiptEmbed';
import { fromISO, money, monthBounds, monthLabel, addDays, longDate } from '../lib/format';

const TYPE_LABEL: Record<DayType, string> = { worked: 'Worked', travel: 'Travel', standby: 'Standby', off: 'Off' };

export default function InvoiceScreen() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const params = useLocalSearchParams<{ client?: string; year?: string; month?: string }>();
  const { dayEntries, expenses, profile, invoiceCounter, bumpInvoiceCounter } = useStore();

  const client = params.client ?? '';
  const year = Number(params.year) || new Date().getFullYear();
  const month = Number(params.month) ?? new Date().getMonth();

  const [invoiceNo, setInvoiceNo] = useState(
    `INV-${year}${String(month + 1).padStart(2, '0')}-${String(invoiceCounter).padStart(3, '0')}`
  );
  const [includePerDiem, setIncludePerDiem] = useState(true);
  const [exported, setExported] = useState(false);

  const inMonth = (iso: string) => {
    const d = fromISO(iso);
    return d.getFullYear() === year && d.getMonth() === month;
  };

  const lines = useMemo<InvoiceLine[]>(() => {
    const out: InvoiceLine[] = [];
    const days = dayEntries.filter((d) => inMonth(d.date) && (d.client ?? '') === client && d.type !== 'off');

    // Day-rate lines grouped by type and rate.
    const groups = new Map<string, { type: DayType; rate: number; count: number }>();
    for (const d of days) {
      const key = `${d.type}|${d.rate}`;
      const g = groups.get(key) ?? { type: d.type, rate: d.rate || 0, count: 0 };
      g.count++;
      groups.set(key, g);
    }
    for (const g of Array.from(groups.values()).sort((a, b) => b.rate * b.count - a.rate * a.count)) {
      out.push({ desc: `${TYPE_LABEL[g.type]} — ${g.count} day${g.count === 1 ? '' : 's'} @ ${money(g.rate)}`, amount: g.count * g.rate });
    }

    // Per diem line.
    if (includePerDiem) {
      const pdDays = days.filter((d) => d.perDiem);
      const pdTotal = pdDays.reduce((sum, d) => sum + (d.perDiemAmount ?? profile.perDiemMie ?? 0), 0);
      if (pdTotal > 0) out.push({ desc: `Per diem (M&IE) — ${pdDays.length} day${pdDays.length === 1 ? '' : 's'}`, amount: pdTotal });
    }

    // Reimbursable expenses, itemized.
    const reimb = expenses.filter((e) => inMonth(e.date) && (e.client ?? '') === client && e.reimbursable);
    for (const e of [...reimb].sort((a, b) => (a.date < b.date ? -1 : 1))) {
      out.push({ desc: `${CATEGORY_LABEL[e.category]}${e.note ? ` — ${e.note}` : ''} (${longDate(e.date)})`, amount: e.amount || 0 });
    }
    return out;
  }, [dayEntries, expenses, client, year, month, includePerDiem, profile.perDiemMie]);

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  const { end } = monthBounds(year, month);
  const dueDate = addDays(end, profile.paymentTermsDays || 0);

  const onExport = async () => {
    try {
      const receipts = (await buildReceiptItems(expenses, year, month)).filter((r) => r.client === client);
      const html = buildInvoiceHtml({
        invoiceNo: invoiceNo.trim() || 'INVOICE',
        client,
        profile,
        billDate: end,
        dueDate,
        lines,
        receipts,
      });
      const { uri } = await Print.printToFileAsync({ html });
      const safeNo = (invoiceNo.trim() || 'invoice').replace(/[^A-Za-z0-9_-]+/g, '_');
      const named = `${FileSystem.cacheDirectory}HitchWell_${safeNo}.pdf`;
      let shareUri = uri;
      try {
        await FileSystem.moveAsync({ from: uri, to: named });
        shareUri = named;
      } catch {
        // fall back to temp name
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: invoiceNo });
      } else {
        await Print.printAsync({ html });
      }
      if (!exported) {
        bumpInvoiceCounter();
        setExported(true); // one bump per screen visit, not per re-share
      }
    } catch {
      // cancelled or share unavailable
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'Invoice' }} />
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.head}>{client || 'Unassigned'}</Text>
        <Text style={s.sub}>{monthLabel(year, month)} · Due {longDate(dueDate)}</Text>

        <Text style={s.label}>Invoice Number</Text>
        <TextInput style={s.input} value={invoiceNo} onChangeText={setInvoiceNo} autoCapitalize="characters" />

        <View style={s.switchRow}>
          <Text style={s.switchLabel}>Include Per Diem</Text>
          <Switch value={includePerDiem} onValueChange={setIncludePerDiem} trackColor={{ true: t.accent }} />
        </View>

        <View style={s.lineBox}>
          {lines.length === 0 ? (
            <Text style={s.empty}>Nothing billable for this client this month.</Text>
          ) : (
            lines.map((l, i) => (
              <View key={i} style={s.line}>
                <Text style={s.lineDesc} numberOfLines={2}>{l.desc}</Text>
                <AmountText style={s.lineAmt}>{money(l.amount)}</AmountText>
              </View>
            ))
          )}
          {lines.length > 0 && (
            <View style={[s.line, s.totalLine]}>
              <Text style={s.totalDesc}>Total Due</Text>
              <AmountText style={s.totalAmt}>{money(total)}</AmountText>
            </View>
          )}
        </View>

        {lines.length > 0 && (
          <Pressable style={s.exportBtn} onPress={onExport}>
            <Text style={s.exportText}>Export Invoice PDF</Text>
          </Pressable>
        )}
        <Text style={s.note}>Receipts for this client attach automatically. Deductions are never billed.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 40 },
    head: { fontSize: 20, fontWeight: '500', color: t.ink },
    sub: { fontSize: 12, color: t.muted, marginTop: 2, marginBottom: 6 },
    label: { fontSize: 12, color: t.muted, marginTop: 16, marginBottom: 8 },
    input: { height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, paddingHorizontal: 13, fontSize: 16, color: t.ink, backgroundColor: t.bg },
    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
    switchLabel: { fontSize: 14, color: t.ink },

    lineBox: { marginTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline },
    line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2 },
    lineDesc: { flex: 1, fontSize: 13, color: t.ink },
    lineAmt: { fontSize: 13, color: t.ink },
    totalLine: { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: t.ink },
    totalDesc: { fontSize: 14, fontWeight: '600', color: t.ink },
    totalAmt: { fontSize: 15, fontWeight: '600', color: t.ink },
    empty: { fontSize: 13, color: t.muted, paddingVertical: 18 },

    exportBtn: { backgroundColor: t.ink, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    exportText: { color: t.onInk, fontSize: 14, fontWeight: '500' },
    note: { fontSize: 11, color: t.faint, marginTop: 12, textAlign: 'center' },
  });
