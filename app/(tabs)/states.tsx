import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, stateColor } from '../../theme/colors';
import { AmountText } from '../../components/AmountText';
import { useStore } from '../../lib/store';
import * as calc from '../../lib/calc';
import { money } from '../../lib/format';

export default function StatesScreen() {
  const { dayEntries, profile } = useStore();
  const year = new Date().getFullYear();
  const slices = calc.byState(dayEntries, year);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Income by state</Text>
        <Text style={styles.sub}>{year} · home state {profile.homeState}</Text>

        {slices.length === 0 ? (
          <Text style={styles.empty}>Log worked or standby days with a state to see your allocation.</Text>
        ) : (
          <>
            {slices.map((s, i) => (
              <View key={s.state} style={styles.row}>
                <View style={styles.rowTop}>
                  <View style={styles.stateLabel}>
                    <View style={[styles.dot, { backgroundColor: stateColor(s.state, i) }]} />
                    <Text style={styles.stateCode}>{s.state}</Text>
                    {s.state === profile.homeState && <Text style={styles.homeTag}>home</Text>}
                  </View>
                  <AmountText style={styles.amount}>{money(s.amount)}</AmountText>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.max(s.pct, 1)}%`, backgroundColor: stateColor(s.state, i) }]} />
                </View>
                <Text style={styles.pct}>{Math.round(s.pct)}%</Text>
              </View>
            ))}

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Nonresident filing</Text>
              <Text style={styles.noteText}>
                Income earned in a state other than {profile.homeState} may require a nonresident return
                there. This screen organizes the split for your CPA. It is not tax advice and does not
                compute what you owe.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '500', color: colors.ink },
  sub: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 18 },
  empty: { fontSize: 14, color: colors.muted, lineHeight: 20, marginTop: 8 },

  row: { marginBottom: 18 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stateLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 3 },
  stateCode: { fontSize: 15, fontWeight: '500', color: colors.ink },
  homeTag: { fontSize: 11, color: colors.accent, backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  amount: { fontSize: 15, fontWeight: '500', color: colors.ink },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  pct: { fontSize: 11, color: colors.muted, marginTop: 4 },

  noteCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginTop: 10 },
  noteTitle: { fontSize: 13, fontWeight: '500', color: colors.ink, marginBottom: 6 },
  noteText: { fontSize: 13, color: colors.muted, lineHeight: 19 },
});
