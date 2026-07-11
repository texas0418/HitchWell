import React from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, AppColors } from '../../theme/colors';
import { useStore } from '../../lib/store';
import { buildCSV } from '../../lib/exportCsv';
import * as calc from '../../lib/calc';

type S = ReturnType<typeof makeStyles>;

function Row({ s, t, icon, label, hint, onPress }: { s: S; t: AppColors; icon: React.ReactNode; label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <View style={s.rowIcon}>{icon}</View>
      <View style={s.rowBody}>
        <Text style={s.rowLabel}>{label}</Text>
        {!!hint && <Text style={s.rowHint}>{hint}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={t.faint} />
    </Pressable>
  );
}

export default function MoreScreen() {
  const t = useTheme();
  const s = React.useMemo(() => makeStyles(t), [t]);
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
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>More</Text>

        <View style={s.group}>
          <Row s={s} t={t} icon={<Ionicons name="document-text-outline" size={20} color={t.ink} />} label="Monthly Report" hint="By client, ready to bill" onPress={() => router.push('/report')} />
        </View>

        <View style={s.group}>
          <Row s={s} t={t} icon={<Ionicons name="receipt-outline" size={20} color={t.ink} />} label="Expenses" hint={`${expenses.length} logged`} onPress={() => router.push('/expenses')} />
          <Row s={s} t={t} icon={<Ionicons name="car-outline" size={20} color={t.ink} />} label="Mileage" hint={`${mileage.length} trips`} onPress={() => router.push('/mileage')} />
          <Row s={s} t={t} icon={<MaterialCommunityIcons name="shield-check-outline" size={20} color={t.ink} />} label="Certs & Tickets" hint={expiringCerts ? `${expiringCerts} need attention` : `${certs.length} tracked`} onPress={() => router.push('/certs')} />
        </View>

        <View style={s.group}>
          <Row s={s} t={t} icon={<Ionicons name="download-outline" size={20} color={t.ink} />} label="Export for CPA" hint={`${year} summary (CSV)`} onPress={onExport} />
          <Row s={s} t={t} icon={<Ionicons name="settings-outline" size={20} color={t.ink} />} label="Settings" onPress={() => router.push('/settings')} />
        </View>

        <Text style={s.footer}>
          Amounts are hidden on launch and unlock with Face ID. Figures are estimates for planning,
          not tax advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 },
    title: { fontSize: 20, fontWeight: '500', color: t.ink, marginBottom: 16 },

    group: { borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 10, overflow: 'hidden', marginBottom: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline2 },
    rowIcon: { width: 24, alignItems: 'center' },
    rowBody: { flex: 1 },
    rowLabel: { fontSize: 14, color: t.ink },
    rowHint: { fontSize: 12, color: t.muted, marginTop: 2 },

    footer: { fontSize: 12, color: t.faint, lineHeight: 18, paddingHorizontal: 4 },
  });
