import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AmountText } from '../../components/AmountText';

// --- Mock data. Replace with Supabase (entries for the selected month). ---
type Entry = {
  dow: string;
  day: string;
  title?: string;
  sub?: string;
  amount?: string;
  off?: boolean;
  empty?: boolean; // today, not yet logged
};

const month = 'June';
const running = '$11,025';
const taxSetAside = '$2,975';

const entries: Entry[] = [
  { dow: 'Tue', day: '20', empty: true },
  { dow: 'Mon', day: '19', title: 'Worked · Midland, TX', sub: 'per diem · TX', amount: '$525' },
  { dow: 'Sun', day: '18', title: 'Travel day · mobe', sub: '412 mi', amount: '$200' },
  { dow: 'Sat', day: '17', title: 'Standby · weather', sub: 'NM', amount: '$300' },
  { dow: 'Fri', day: '16', title: 'Worked · Midland, TX', sub: 'per diem · TX', amount: '$525' },
  { dow: 'Thu', day: '15', off: true },
  { dow: 'Wed', day: '14', title: 'Worked · Hobbs, NM', sub: 'per diem · NM', amount: '$525' },
];

export default function LogbookScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.monthRow}>
          <Ionicons name="chevron-back" size={16} color={colors.faint} />
          <Text style={styles.month}>{month}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.faint} />
        </View>
        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>running </Text>
            <AmountText style={styles.totalValue}>{running}</AmountText>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>tax </Text>
            <AmountText style={[styles.totalValue, { color: colors.danger }]}>{taxSetAside}</AmountText>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {entries.map((e) => {
          if (e.empty) {
            return (
              <Pressable key={e.day} style={styles.emptyRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.dow}>{e.dow}</Text>
                  <Text style={styles.dayNum}>{e.day}</Text>
                </View>
                <View style={styles.emptyTextRow}>
                  <Ionicons name="add" size={14} color={colors.muted} />
                  <Text style={styles.emptyText}>Tap to log today</Text>
                </View>
              </Pressable>
            );
          }
          return (
            <Pressable key={e.day} style={[styles.row, e.off && styles.rowOff]}>
              <View style={styles.dateCol}>
                <Text style={styles.dow}>{e.dow}</Text>
                <Text style={styles.dayNum}>{e.day}</Text>
              </View>
              {e.off ? (
                <Text style={styles.offText}>Off</Text>
              ) : (
                <View style={styles.body}>
                  <Text style={styles.title}>{e.title}</Text>
                  {!!e.sub && <Text style={styles.sub}>{e.sub}</Text>}
                </View>
              )}
              {e.off ? (
                <Text style={styles.dash}>—</Text>
              ) : (
                <AmountText style={styles.amount}>{e.amount}</AmountText>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable style={styles.fab} accessibilityLabel="Add entry">
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  month: { fontSize: 18, fontWeight: '500', color: colors.ink },
  totals: { alignItems: 'flex-end' },
  totalLine: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { fontSize: 11, color: colors.muted },
  totalValue: { fontSize: 11, fontWeight: '500', color: colors.ink },

  list: { paddingBottom: 96 },

  emptyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 14, marginBottom: 6, paddingHorizontal: 12, paddingVertical: 13,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 11,
  },
  emptyTextRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyText: { fontSize: 13, color: colors.muted },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 18, paddingVertical: 13,
    borderTopWidth: 0.5, borderTopColor: colors.hairline2,
  },
  rowOff: { opacity: 0.55 },

  dateCol: { width: 36, alignItems: 'center' },
  dow: { fontSize: 11, color: colors.muted },
  dayNum: { fontSize: 16, color: colors.ink },

  body: { flex: 1 },
  title: { fontSize: 14, color: colors.ink },
  sub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  offText: { flex: 1, fontSize: 14, color: colors.muted },

  amount: { fontSize: 14, fontWeight: '500', color: colors.ink },
  dash: { fontSize: 14, color: colors.faint },

  fab: {
    position: 'absolute', right: 16, bottom: 24,
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
  },
});
