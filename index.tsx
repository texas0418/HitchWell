import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { usePrivacy } from '../../context/PrivacyContext';
import { AmountText } from '../../components/AmountText';

// --- Mock data. Replace with Supabase queries (year-to-date rollup). ---
const ytd = {
  income: '$82,400',
  taxSetAside: '$22,300',
  net: '$60,100',
  daysOut: 47,
  perDiemDays: 118,
  mileage: '9,840',
  byState: [
    { code: 'TX', pct: 58, color: colors.state.TX },
    { code: 'NM', pct: 24, color: colors.state.NM },
    { code: 'OK', pct: 18, color: colors.state.OK },
  ],
};

export default function HomeScreen() {
  const { hidden, toggle } = usePrivacy();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>2026 · year to date</Text>
          <Pressable
            onPress={toggle}
            hitSlop={8}
            style={styles.eyeBtn}
            accessibilityLabel={hidden ? 'Show amounts' : 'Hide amounts'}
          >
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.ink} />
          </Pressable>
        </View>

        <Text style={styles.label}>Income earned</Text>
        <AmountText style={styles.hero}>{ytd.income}</AmountText>

        <View style={styles.cardRow}>
          <View style={styles.statCard}>
            <Text style={styles.cardLabel}>Set aside · tax</Text>
            <AmountText style={[styles.cardValue, { color: colors.danger }]}>{ytd.taxSetAside}</AmountText>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.cardLabel}>Net so far</Text>
            <AmountText style={styles.cardValue}>{ytd.net}</AmountText>
          </View>
        </View>

        <View style={styles.stateCard}>
          <View style={styles.stateHeader}>
            <Text style={styles.stateTitle}>Income by state</Text>
            <View style={styles.stateLink}>
              <Text style={styles.linkText}>{ytd.byState.length} states</Text>
              <Ionicons name="chevron-forward" size={13} color={colors.accent} />
            </View>
          </View>
          <View style={styles.bar}>
            {ytd.byState.map((s) => (
              <View key={s.code} style={{ flex: s.pct, backgroundColor: s.color }} />
            ))}
          </View>
          <View style={styles.legendRow}>
            {ytd.byState.map((s) => (
              <View key={s.code} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text style={styles.legendText}>
                  {s.code} {s.pct}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.miniRow}>
          <View style={styles.mini}>
            <Text style={styles.miniLabel}>Days out</Text>
            <Text style={styles.miniValue}>{ytd.daysOut}</Text>
          </View>
          <View style={styles.mini}>
            <Text style={styles.miniLabel}>Per diem dy</Text>
            <Text style={styles.miniValue}>{ytd.perDiemDays}</Text>
          </View>
          <View style={styles.mini}>
            <Text style={styles.miniLabel}>Mileage</Text>
            <Text style={styles.miniValue}>{ytd.mileage}</Text>
          </View>
        </View>

        <Pressable style={styles.logBtn} accessibilityRole="button">
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.logBtnText}>Log today</Text>
        </Pressable>

        <View style={styles.certRow}>
          <MaterialCommunityIcons name="shield-alert-outline" size={16} color={colors.danger} />
          <Text style={styles.certText}>H2S Alive · 23 days</Text>
          <Text style={styles.certMuted}> · TWIC · 4 mo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  eyebrow: { fontSize: 13, color: colors.muted },
  eyeBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },

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
  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.muted },

  miniRow: { flexDirection: 'row', marginBottom: 18 },
  mini: { flex: 1 },
  miniLabel: { fontSize: 11, color: colors.muted },
  miniValue: { fontSize: 16, fontWeight: '500', color: colors.ink },

  logBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 15, marginBottom: 12,
  },
  logBtnText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  certRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  certText: { fontSize: 12, color: colors.danger },
  certMuted: { fontSize: 12, color: colors.muted },
});
