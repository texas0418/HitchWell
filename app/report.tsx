import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme, AppColors } from '../theme/colors';
import { AmountText } from '../components/AmountText';
import { useStore, CATEGORY_LABEL } from '../lib/store';
import { buildMonthlyReport, buildReportText, clientLabel } from '../lib/report';
import { buildReportHtml } from '../lib/reportHtml';
import { buildReceiptItems } from '../lib/receiptEmbed';
import { money, num, monthLabel, addMonths, longDateYear, monthName } from '../lib/format';

export default function ReportScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const { dayEntries, expenses, mileage, profile } = useStore();

  const now = new Date();
  const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const report = useMemo(
    () => buildMonthlyReport(dayEntries, expenses, mileage, profile, ym.year, ym.month),
    [dayEntries, expenses, mileage, profile, ym]
  );

  const step = (n: number) => setYm((cur) => addMonths(cur.year, cur.month, n));

  const onExportPdf = async () => {
    try {
      // Read this month's receipt photos and embed them per client.
      const receipts = await buildReceiptItems(expenses, ym.year, ym.month);
      const html = buildReportHtml(report, profile, receipts);
      const { uri } = await Print.printToFileAsync({ html });

      // Give the file a real name before sharing.
      const named = `${FileSystem.cacheDirectory}HitchWell_${monthName(ym.month)}_${ym.year}.pdf`;
      let shareUri = uri;
      try {
        await FileSystem.moveAsync({ from: uri, to: named });
        shareUri = named;
      } catch {
        // rename failed; share the temp file rather than nothing
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: `HitchWell ${monthLabel(ym.year, ym.month)}` });
      } else {
        await Print.printAsync({ html });
      }
    } catch {
      // cancelled or print/share unavailable
    }
  };

  const onShareText = async () => {
    try {
      await Share.share({ message: buildReportText(report), title: `HitchWell ${monthLabel(ym.year, ym.month)}` });
    } catch {
      // cancelled or unavailable
    }
  };

  const hasData = report.clients.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthRow}>
          <Pressable style={styles.stepBtn} onPress={() => step(-1)} hitSlop={8}><Ionicons name="chevron-back" size={20} color={t.ink} /></Pressable>
          <Text style={styles.monthText}>{monthLabel(ym.year, ym.month)}</Text>
          <Pressable style={styles.stepBtn} onPress={() => step(1)} hitSlop={8}><Ionicons name="chevron-forward" size={20} color={t.ink} /></Pressable>
        </View>

        {hasData ? (
          <>
            <Text style={styles.dates}>
              Bill {longDateYear(report.billingDate)} · Paid ~{longDateYear(report.expectedPayDate)}
            </Text>

            {report.clients.map((c) => (
              <View key={c.client || 'unassigned'} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.client}>{clientLabel(c.client)}</Text>
                  <AmountText style={styles.invoice}>{money(c.invoiceTotal)}</AmountText>
                </View>
                <Text style={styles.invoiceLabel}>invoice total</Text>

                <View style={styles.line}><Text style={styles.k}>Days worked</Text><Text style={styles.v}>{c.workedDays}{c.perDiemDays ? ` · ${c.perDiemDays} per diem` : ''}</Text></View>
                <View style={styles.line}><Text style={styles.k}>Day-rate income</Text><AmountText style={styles.v}>{money(c.income)}</AmountText></View>
                {c.perDiem > 0 && (
                  <View style={styles.line}><Text style={styles.k}>Per diem ({c.perDiemDays}d)</Text><AmountText style={styles.v}>{money(c.perDiem)}</AmountText></View>
                )}

                {c.reimbursable > 0 && (
                  <>
                    <View style={styles.line}><Text style={styles.k}>Reimbursable</Text><AmountText style={styles.v}>{money(c.reimbursable)}</AmountText></View>
                    {c.reimbursableByCategory.map((cat) => (
                      <View key={cat.category} style={styles.subLine}>
                        <Text style={styles.subK}>{CATEGORY_LABEL[cat.category]}</Text>
                        <AmountText style={styles.subV}>{money(cat.amount)}</AmountText>
                      </View>
                    ))}
                  </>
                )}

                {c.miles > 0 && (
                  <View style={styles.line}>
                    <Text style={styles.k}>Mileage</Text>
                    <View style={styles.mileRight}>
                      <Text style={styles.v}>{num(c.miles)} mi · </Text>
                      <AmountText style={styles.v}>{money(c.mileageDeduction)}</AmountText>
                      <Text style={styles.vMuted}> est.</Text>
                    </View>
                  </View>
                )}

                {c.deductible > 0 && (
                  <View style={styles.line}><Text style={styles.kMuted}>Your deductions (not billed)</Text><AmountText style={styles.vMuted}>{money(c.deductible)}</AmountText></View>
                )}
              </View>
            ))}

            <View style={[styles.card, styles.totalCard]}>
              <Text style={styles.totalTitle}>Totals</Text>
              <View style={styles.line}><Text style={styles.k}>Day-rate income</Text><AmountText style={styles.v}>{money(report.totals.income)}</AmountText></View>
              {report.totals.perDiem > 0 && (
                <View style={styles.line}><Text style={styles.k}>Per diem (M&IE)</Text><AmountText style={styles.v}>{money(report.totals.perDiem)}</AmountText></View>
              )}
              <View style={styles.line}><Text style={styles.k}>Reimbursable</Text><AmountText style={styles.v}>{money(report.totals.reimbursable)}</AmountText></View>
              <View style={styles.line}><Text style={styles.kStrong}>Invoice total</Text><AmountText style={styles.vStrong}>{money(report.totals.invoiceTotal)}</AmountText></View>
              <View style={styles.line}><Text style={styles.kMuted}>Your deductions</Text><AmountText style={styles.vMuted}>{money(report.totals.deductible)}</AmountText></View>
              <View style={styles.line}><Text style={styles.kMuted}>Mileage</Text><Text style={styles.vMuted}>{num(report.totals.miles)} mi</Text></View>
            </View>

            <Pressable style={styles.shareBtn} onPress={onExportPdf}>
              <Ionicons name="document-outline" size={18} color="#fff" />
              <Text style={styles.shareText}>Export PDF</Text>
            </Pressable>
            <Pressable style={styles.textBtn} onPress={onShareText}>
              <Text style={styles.textBtnLabel}>Share as text</Text>
            </Pressable>
            <Text style={styles.note}>Figures are estimates, not tax advice.</Text>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No days, expenses, or mileage logged for this month.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  content: { padding: 18, paddingBottom: 40 },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  stepBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 0.5, borderColor: t.border, alignItems: 'center', justifyContent: 'center' },
  monthText: { fontSize: 18, fontWeight: '500', color: t.ink },
  dates: { fontSize: 12, color: t.muted, textAlign: 'center', marginBottom: 18 },

  card: { borderWidth: 0.5, borderColor: t.border, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  client: { fontSize: 16, fontWeight: '500', color: t.ink, flexShrink: 1 },
  invoice: { fontSize: 22, fontWeight: '600', color: t.accent },
  invoiceLabel: { fontSize: 11, color: t.muted, textAlign: 'right', marginTop: -2, marginBottom: 8 },

  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  mileRight: { flexDirection: 'row', alignItems: 'center' },
  k: { fontSize: 14, color: t.ink },
  v: { fontSize: 14, color: t.ink },
  kStrong: { fontSize: 14, fontWeight: '600', color: t.ink },
  vStrong: { fontSize: 14, fontWeight: '600', color: t.ink },
  kMuted: { fontSize: 13, color: t.muted },
  vMuted: { fontSize: 13, color: t.muted },

  subLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, paddingLeft: 12 },
  subK: { fontSize: 12, color: t.muted },
  subV: { fontSize: 12, color: t.muted },

  totalCard: { backgroundColor: t.surface, borderColor: t.surface },
  totalTitle: { fontSize: 12, color: t.muted, marginBottom: 6 },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: t.ink, borderRadius: 14, paddingVertical: 15, marginTop: 6 },
  shareText: { color: t.onInk, fontSize: 15, fontWeight: '500' },
  textBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  textBtnLabel: { color: t.accent, fontSize: 14 },
  note: { fontSize: 11, color: t.muted, marginTop: 12, textAlign: 'center' },

  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 14, color: t.muted, textAlign: 'center' },
});
