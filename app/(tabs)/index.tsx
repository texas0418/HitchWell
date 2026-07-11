import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, stateColor, AppColors } from '../../theme/colors';
import { usePrivacy } from '../../context/PrivacyContext';
import { AmountText } from '../../components/AmountText';
import { useStore } from '../../lib/store';
import * as calc from '../../lib/calc';
import { money, num } from '../../lib/format';

// Money home — terminal/utility style. Flat rows, hairline dividers,
// one hero number, everything else dense and left-aligned.

export default function HomeScreen() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const { hidden, toggle } = usePrivacy();
  const { profile, dayEntries, expenses, mileage, certs } = useStore();

  const year = new Date().getFullYear();
  const inc = calc.income(dayEntries, year);
  const setAside = calc.taxSetAside(inc, profile);
  const net = calc.netSoFar(inc, profile);
  const states = calc.byState(dayEntries, year).slice(0, 4);
  const out = calc.daysOut(dayEntries, year);
  const pdTotal = calc.perDiemTotal(dayEntries, year, profile);
  const pdDays = calc.perDiemDays(dayEntries, year);
  const reimbOpen = calc.reimbursableTotal(expenses, year);
  const miles = calc.totalMileage(mileage, year);

  const nextCert = [...certs]
    .map((c) => ({ c, ...calc.certStatus(c) }))
    .filter((x) => x.status !== 'ok')
    .sort((a, b) => a.days - b.days)[0];

  const empty = dayEntries.length === 0;
  const pctHeld = Math.round((profile.taxSetAsidePct || 0) * 100);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Text style={s.eyebrow}>{year} · Monthly biller · Net-{profile.paymentTermsDays}</Text>
          <Pressable onPress={toggle} hitSlop={8} accessibilityLabel={hidden ? 'Show amounts' : 'Hide amounts'}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={t.ink} />
          </Pressable>
        </View>

        {empty ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyTitle}>Nothing Logged Yet</Text>
            <Text style={s.emptyNote}>Log a day and your income, tax hold, and state split build from there.</Text>
            <Pressable style={s.primaryBtn} onPress={() => router.push('/entry')}>
              <Text style={s.primaryText}>Log First Day · {money(profile.defaultDayRate)}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.heroRow}>
              <AmountText style={s.hero}>{money(net)}</AmountText>
              <Text style={s.heroSub}>Net after {pctHeld}% held</Text>
            </View>

            <Row s={s} k="Income" v={<AmountText style={s.v}>{money(inc)}</AmountText>} />
            <Row s={s} k="Tax Set-Aside" v={<AmountText style={[s.v, { color: t.danger }]}>{money(setAside)}</AmountText>} />
            <Row s={s} k={`Per Diem · ${pdDays}d`} v={<AmountText style={s.v}>{money(pdTotal)}</AmountText>} />
            <Row
              s={s}
              k="Reimbursable Open"
              v={<AmountText style={[s.v, { color: t.accent }]}>{money(reimbOpen)}</AmountText>}
              onPress={() => router.push('/expenses')}
            />
            <Row s={s} k="Days Out" v={<Text style={s.v}>{out}</Text>} />
            <Row s={s} k="Mileage" v={<Text style={s.v}>{num(miles)} mi</Text>} />

            {nextCert && (
              <Row
                s={s}
                k={nextCert.c.name}
                v={<Text style={[s.v, { color: t.danger }]}>{nextCert.days < 0 ? 'expired' : `${nextCert.days}d`}</Text>}
                kColor={t.danger}
                onPress={() => router.push('/certs')}
              />
            )}

            {states.length > 0 && (
              <Pressable style={s.stateBlock} onPress={() => router.push('/states')}>
                <View style={s.bar}>
                  {states.map((st, i) => (
                    <View key={st.state} style={{ flex: Math.max(st.pct, 1), backgroundColor: stateColor(st.state, i, t) }} />
                  ))}
                </View>
                <View style={s.legendRow}>
                  <Text style={s.legendText}>
                    {states.map((st) => `${st.state} ${Math.round(st.pct)}%`).join(' · ')}
                  </Text>
                  <Text style={s.legendLink}>States →</Text>
                </View>
              </Pressable>
            )}

            <View style={s.actions}>
              <Pressable style={s.primaryBtn} onPress={() => router.push('/entry')}>
                <Text style={s.primaryText}>Log {money(profile.defaultDayRate)}</Text>
              </Pressable>
              <Pressable style={s.secondaryBtn} onPress={() => router.push('/expenses')}>
                <Text style={s.secondaryText}>Expense</Text>
              </Pressable>
              <Pressable style={s.secondaryBtn} onPress={() => router.push('/report')}>
                <Text style={s.secondaryText}>Report</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  s, k, v, kColor, onPress,
}: {
  s: ReturnType<typeof makeStyles>;
  k: string;
  v: React.ReactNode;
  kColor?: string;
  onPress?: () => void;
}) {
  const inner = (
    <View style={s.row}>
      <Text style={[s.k, kColor ? { color: kColor } : null]}>{k}</Text>
      {v}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 4 },
    eyebrow: { fontSize: 12, color: t.faint },

    emptyWrap: { paddingVertical: 40 },
    emptyTitle: { fontSize: 17, fontWeight: '500', color: t.ink, marginBottom: 6 },
    emptyNote: { fontSize: 13, color: t.muted, lineHeight: 19, marginBottom: 22 },

    heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline },
    hero: { fontSize: 32, fontWeight: '500', color: t.ink, letterSpacing: -0.5 },
    heroSub: { fontSize: 12, color: t.muted, paddingBottom: 5 },

    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2 },
    k: { fontSize: 13, color: t.muted },
    v: { fontSize: 13, color: t.ink },

    stateBlock: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2 },
    bar: { flexDirection: 'row', gap: 2, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 7 },
    legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
    legendText: { fontSize: 11, color: t.muted },
    legendLink: { fontSize: 11, color: t.faint },

    actions: { flexDirection: 'row', gap: 8, marginTop: 18 },
    primaryBtn: { flex: 1.4, backgroundColor: t.ink, borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
    primaryText: { color: t.onInk, fontSize: 13, fontWeight: '500' },
    secondaryBtn: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
    secondaryText: { color: t.muted, fontSize: 13 },
  });
