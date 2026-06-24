import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, stateColor } from '../../theme/colors';
import { usePrivacy } from '../../context/PrivacyContext';
import { AmountText } from '../../components/AmountText';
import { useStore } from '../../lib/store';
import * as calc from '../../lib/calc';
import { money, num } from '../../lib/format';

export default function HomeScreen() {
  const router = useRouter();
  const { hidden, toggle } = usePrivacy();
  const { profile, dayEntries, mileage, certs } = useStore();

  const year = new Date().getFullYear();
  const inc = calc.income(dayEntries, year);
  const setAside = calc.taxSetAside(inc, profile);
  const net = calc.netSoFar(inc, profile);
  const states = calc.byState(dayEntries, year).slice(0, 4);
  const out = calc.daysOut(dayEntries, year);
  const pd = calc.perDiemDays(dayEntries, year);
  const miles = calc.totalMileage(mileage, year);

  const nextCert = [...certs]
    .map((c) => ({ c, ...calc.certStatus(c) }))
    .filter((x) => x.status !== 'ok')
    .sort((a, b) => a.days - b.days)[0];

  const empty = dayEntries.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>{year} · year to date</Text>
          <Pressable onPress={toggle} hitSlop={8} style={styles.eyeBtn} accessibilityLabel={hidden ? 'Show amounts' : 'Hide amounts'}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.ink} />
          </Pressable>
        </View>

        {empty ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No days logged yet</Text>
            <Text style={styles.emptyNote}>Log a day and your income, taxes, and state split show up here.</Text>
            <Pressable style={styles.logBtn} onPress={() => router.push('/entry')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.logBtnText}>Log your first day</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Income earned</Text>
            <AmountText style={styles.hero}>{money(inc)}</AmountText>

            <View style={styles.cardRow}>
              <View style={styles.statCard}>
                <Text style={styles.cardLabel}>Set aside · tax</Text>
                <AmountText style={[styles.cardValue, { color: colors.danger }]}>{money(setAside)}</AmountText>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.cardLabel}>Net so far</Text>
                <AmountText style={styles.cardValue}>{money(net)}</AmountText>
              </View>
            </View>

            {states.length > 0 && (
              <Pressable style={styles.stateCard} onPress={() => router.push('/states')}>
                <View style={styles.stateHeader}>
                  <Text style={styles.stateTitle}>Income by state</Text>
                  <View style={styles.stateLink}>
                    <Text style={styles.linkText}>{states.length} states</Text>
                    <Ionicons name="chevron-forward" size={13} color={colors.accent} />
                  </View>
                </View>
                <View style={styles.bar}>
                  {states.map((s, i) => (
                    <View key={s.state} style={{ flex: Math.max(s.pct, 1), backgroundColor: stateColor(s.state, i) }} />
                  ))}
                </View>
                <View style={styles.legendRow}>
                  {states.map((s, i) => (
                    <View key={s.state} style={styles.legendItem}>
                      <View style={[styles.dot, { backgroundColor: stateColor(s.state, i) }]} />
                      <Text style={styles.legendText}>{s.state} {Math.round(s.pct)}%</Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            )}

            <View style={styles.miniRow}>
              <View style={styles.mini}><Text style={styles.miniLabel}>Days out</Text><Text style={styles.miniValue}>{out}</Text></View>
              <View style={styles.mini}><Text style={styles.miniLabel}>Per diem dy</Text><Text style={styles.miniValue}>{pd}</Text></View>
              <View style={styles.mini}><Text style={styles.miniLabel}>Mileage</Text><Text style={styles.miniValue}>{num(miles)}</Text></View>
            </View>

            <Pressable style={styles.logBtn} onPress={() => router.push('/entry')}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.logBtnText}>Log today</Text>
            </Pressable>

            {nextCert && (
              <Pressable style={styles.certRow} onPress={() => router.push('/certs')}>
                <MaterialCommunityIcons name="shield-alert-outline" size={16} color={colors.danger} />
                <Text style={styles.certText}>
                  {nextCert.c.name} {nextCert.days < 0 ? 'expired' : `· ${nextCert.days} days`}
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  eyebrow: { fontSize: 13, color: colors.muted },
  eyeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },

  emptyWrap: { paddingVertical: 40, alignItems: 'flex-start' },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: colors.ink, marginBottom: 6 },
  emptyNote: { fontSize: 14, color: colors.muted, lineHeight: 20, marginBottom: 20 },

  label: { fontSize: 13, color: colors.muted },
  hero: { fontSize: 34, fontWeight: '500', color: colors.ink, lineHeight: 40, marginBottom: 14 },

  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14 },
  cardLabel: { fontSize: 11, color: colors.muted, marginBottom: 2 },
  cardValue: { fontSize: 18, fontWeight: '500', color: colors.ink },

  stateCard: { borderWidth: 0.5, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 16 },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stateTitle: { fontSize: 13, fontWeight: '500', color: colors.ink },
  stateLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { fontSize: 11, color: colors.accent },
  bar: { flexDirection: 'row', gap: 3, height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.muted },

  miniRow: { flexDirection: 'row', marginVertical: 18 },
  mini: { flex: 1 },
  miniLabel: { fontSize: 11, color: colors.muted },
  miniValue: { fontSize: 16, fontWeight: '500', color: colors.ink },

  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 15, marginBottom: 12 },
  logBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  certRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  certText: { fontSize: 12, color: colors.danger },
});
