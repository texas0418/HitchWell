import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { AmountText } from '../../components/AmountText';
import { useStore, DayType } from '../../lib/store';
import * as calc from '../../lib/calc';
import { dow, dayNum, money, todayISO } from '../../lib/format';

const TYPE_LABEL: Record<DayType, string> = {
  worked: 'Worked',
  travel: 'Travel day',
  standby: 'Standby',
  off: 'Off',
};

export default function LogbookScreen() {
  const router = useRouter();
  const { dayEntries } = useStore();
  const year = new Date().getFullYear();

  const sorted = [...dayEntries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const running = calc.income(dayEntries, year);
  const setAside = calc.taxSetAside(running, useStore.getState().profile);
  const hasToday = dayEntries.some((d) => d.date === todayISO());

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Logbook</Text>
        <View style={styles.totals}>
          <Text style={styles.totalLabel}>YTD </Text>
          <AmountText style={styles.totalValue}>{money(running)}</AmountText>
          <Text style={styles.totalLabel}>  ·  tax </Text>
          <AmountText style={[styles.totalValue, { color: colors.danger }]}>{money(setAside)}</AmountText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {!hasToday && (
          <Pressable style={styles.emptyRow} onPress={() => router.push('/entry')}>
            <View style={styles.dateCol}>
              <Text style={styles.dow}>{dow(todayISO())}</Text>
              <Text style={styles.dayNum}>{dayNum(todayISO())}</Text>
            </View>
            <View style={styles.emptyTextRow}>
              <Ionicons name="add" size={14} color={colors.muted} />
              <Text style={styles.emptyText}>Tap to log today</Text>
            </View>
          </Pressable>
        )}

        {sorted.map((e) => (
          <Pressable
            key={e.id}
            style={[styles.row, e.type === 'off' && styles.rowOff]}
            onPress={() => router.push({ pathname: '/entry', params: { id: e.id } })}
          >
            <View style={styles.dateCol}>
              <Text style={styles.dow}>{dow(e.date)}</Text>
              <Text style={styles.dayNum}>{dayNum(e.date)}</Text>
            </View>
            {e.type === 'off' ? (
              <Text style={styles.offText}>Off</Text>
            ) : (
              <View style={styles.body}>
                <Text style={styles.rowTitle}>
                  {TYPE_LABEL[e.type]}{e.location ? ` · ${e.location}` : ''}
                </Text>
                <Text style={styles.sub}>
                  {[e.perDiem ? 'per diem' : null, e.state || null, e.client || null].filter(Boolean).join(' · ') || '—'}
                </Text>
              </View>
            )}
            {e.type === 'off' ? (
              <Text style={styles.dash}>—</Text>
            ) : (
              <AmountText style={styles.amount}>{money(e.rate)}</AmountText>
            )}
          </Pressable>
        ))}

        {sorted.length === 0 && hasToday && (
          <Text style={styles.emptyNote}>No other entries yet.</Text>
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/entry')} accessibilityLabel="Add entry">
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 18, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '500', color: colors.ink, marginBottom: 4 },
  totals: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: colors.muted },
  totalValue: { fontSize: 12, fontWeight: '500', color: colors.ink },

  list: { paddingBottom: 96 },

  emptyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 14, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 11,
  },
  emptyTextRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyText: { fontSize: 13, color: colors.muted },
  emptyNote: { fontSize: 13, color: colors.muted, padding: 18 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 13, borderTopWidth: 0.5, borderTopColor: colors.hairline2 },
  rowOff: { opacity: 0.55 },
  dateCol: { width: 36, alignItems: 'center' },
  dow: { fontSize: 11, color: colors.muted },
  dayNum: { fontSize: 16, color: colors.ink },
  body: { flex: 1 },
  rowTitle: { fontSize: 14, color: colors.ink },
  sub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  offText: { flex: 1, fontSize: 14, color: colors.muted },
  amount: { fontSize: 14, fontWeight: '500', color: colors.ink },
  dash: { fontSize: 14, color: colors.faint },

  fab: { position: 'absolute', right: 16, bottom: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
