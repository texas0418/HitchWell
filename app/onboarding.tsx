import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, AppColors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { NumField } from '../components/NumField';
import { StatePicker } from '../components/StatePicker';
import { useStore, PayPeriod, PAY_PERIODS } from '../lib/store';

export default function Onboarding() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const { setProfile, setOnboarded } = useStore();

  const [rate, setRate] = useState('525');
  const [homeState, setHomeState] = useState('TX');
  const [payPeriod, setPayPeriod] = useState<PayPeriod>('monthly');

  const start = () => {
    setProfile({ defaultDayRate: Number(rate) || 0, homeState, payPeriod });
    setOnboarded(true);
    router.replace('/');
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.brand}>hitchwell</Text>
        <Text style={s.lead}>A few defaults so logging a day takes one tap. All of it can change later in settings.</Text>

        <Text style={s.label}>your usual day rate ($)</Text>
        <NumField value={rate} onChangeText={setRate} keyboardType="number-pad" />

        <Text style={s.label}>home state</Text>
        <StatePicker value={homeState} onChange={setHomeState} />

        <Text style={s.label}>pay period</Text>
        <View style={s.chipRow}>
          {PAY_PERIODS.map((p) => (
            <Chip key={p.key} label={p.label} selected={payPeriod === p.key} onPress={() => setPayPeriod(p.key)} />
          ))}
        </View>
        <Text style={s.note}>This sets how your expense reports group hours, mileage, and receipts.</Text>

        <Pressable style={s.btn} onPress={start}>
          <Text style={s.btnText}>get started</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 20, paddingTop: 40, paddingBottom: 40 },
    brand: { fontSize: 26, fontWeight: '500', color: t.ink },
    lead: { fontSize: 13, color: t.muted, lineHeight: 19, marginTop: 8, marginBottom: 8 },
    label: { fontSize: 12, color: t.muted, marginTop: 22, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    note: { fontSize: 11, color: t.faint, marginTop: 8 },
    btn: { backgroundColor: t.ink, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 34 },
    btnText: { color: t.onInk, fontSize: 15, fontWeight: '500' },
  });
