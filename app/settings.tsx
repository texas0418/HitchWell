import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, AppColors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { useStore, Appearance } from '../lib/store';

type S = ReturnType<typeof makeStyles>;

function Row({ s, t, icon, label, hint, onPress }: { s: S; t: AppColors; icon: keyof typeof Ionicons.glyphMap; label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <View style={s.rowIcon}><Ionicons name={icon} size={19} color={t.ink} /></View>
      <View style={s.rowBody}>
        <Text style={s.rowLabel}>{label}</Text>
        {!!hint && <Text style={s.rowHint}>{hint}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color={t.faint} />
    </Pressable>
  );
}

export default function SettingsMenu() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const { appearance, setAppearance } = useStore();

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.group}>
          <Row s={s} t={t} icon="person-outline" label="Profile" hint="Name, employment, home state" onPress={() => router.push('/settings-profile')} />
          <Row s={s} t={t} icon="cash-outline" label="Rates" hint="Day, travel, standby, mileage" onPress={() => router.push('/settings-rates')} />
          <Row s={s} t={t} icon="calendar-outline" label="Billing" hint="Period, terms, per diem, tax hold" onPress={() => router.push('/settings-billing')} />
          <Row s={s} t={t} icon="briefcase-outline" label="Business Details" hint="Invoice From block and payment info" onPress={() => router.push('/settings-business')} />
          <Row s={s} t={t} icon="repeat-outline" label="Hitch Schedule" hint="Rotation for calendar and forecasts" onPress={() => router.push('/settings-hitch')} />
        </View>

        <View style={s.group}>
          <Row s={s} t={t} icon="people-outline" label="Clients & Projects" hint="The pick-lists reports group on" onPress={() => router.push('/settings-lists')} />
        </View>

        <View style={s.group}>
          <Row s={s} t={t} icon="archive-outline" label="Backup & Data" hint="Export, import, sample, clear" onPress={() => router.push('/settings-data')} />
        </View>

        <View style={s.group}>
          <Row s={s} t={t} icon="ribbon-outline" label="HitchWell Pro" hint="Unlock PDF reports and invoices" onPress={() => router.push('/paywall')} />
        </View>

        <Text style={s.appLabel}>Appearance</Text>
        <View style={s.chipRow}>
          {(['system', 'light', 'dark'] as Appearance[]).map((a) => (
            <Chip
              key={a}
              label={a === 'system' ? 'System' : a === 'light' ? 'Light' : 'Dark'}
              selected={appearance === a}
              onPress={() => setAppearance(a)}
            />
          ))}
        </View>
        <Text style={s.appNote}>Applies immediately. System follows your phone setting.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 40 },
    group: { borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 10, overflow: 'hidden', marginBottom: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline2 },
    rowIcon: { width: 24, alignItems: 'center' },
    rowBody: { flex: 1 },
    rowLabel: { fontSize: 14, color: t.ink },
    rowHint: { fontSize: 12, color: t.muted, marginTop: 2 },
    appLabel: { fontSize: 12, color: t.muted, marginTop: 12, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    appNote: { fontSize: 11, color: t.faint, marginTop: 6 },
  });
