import React from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useStore } from '../../lib/store';
import { buildCSV } from '../../lib/exportCsv';
import * as calc from '../../lib/calc';

function Row({ icon, label, hint, onPress }: { icon: React.ReactNode; label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        {!!hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.faint} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { dayEntries, expenses, mileage, certs } = useStore();
  const year = new Date().getFullYear();

  const expiringCerts = certs.filter((c) => calc.certStatus(c).status !== 'ok').length;

  const onExport = async () => {
    const csv = buildCSV(dayEntries, expenses, mileage, year);
    try {
      await Share.share({ message: csv, title: `HitchWell ${year}` });
    } catch {
      // user cancelled or share unavailable
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>More</Text>

        <View style={styles.group}>
          <Row icon={<Ionicons name="document-text-outline" size={20} color={colors.ink} />} label="Monthly report" hint="By client, ready to bill" onPress={() => router.push('/report')} />
        </View>

        <View style={styles.group}>
          <Row icon={<Ionicons name="receipt-outline" size={20} color={colors.ink} />} label="Expenses" hint={`${expenses.length} logged`} onPress={() => router.push('/expenses')} />
          <Row icon={<Ionicons name="car-outline" size={20} color={colors.ink} />} label="Mileage" hint={`${mileage.length} trips`} onPress={() => router.push('/mileage')} />
          <Row icon={<MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.ink} />} label="Certs & tickets" hint={expiringCerts ? `${expiringCerts} need attention` : `${certs.length} tracked`} onPress={() => router.push('/certs')} />
        </View>

        <View style={styles.group}>
          <Row icon={<Ionicons name="download-outline" size={20} color={colors.ink} />} label="Export for CPA" hint={`${year} summary (CSV)`} onPress={onExport} />
          <Row icon={<Ionicons name="settings-outline" size={20} color={colors.ink} />} label="Settings" onPress={() => router.push('/settings')} />
        </View>

        <Text style={styles.footer}>
          Amounts are hidden on launch and unlock with Face ID. Figures are estimates for planning,
          not tax advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '500', color: colors.ink, marginBottom: 16 },

  group: { borderWidth: 0.5, borderColor: colors.border, borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: colors.hairline2 },
  rowIcon: { width: 24, alignItems: 'center' },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 15, color: colors.ink },
  rowHint: { fontSize: 12, color: colors.muted, marginTop: 2 },

  footer: { fontSize: 12, color: colors.muted, lineHeight: 18, paddingHorizontal: 4 },
});
