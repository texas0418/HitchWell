import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { useStore, PayPeriod, PAY_PERIODS } from '../lib/store';

const STATES = ['TX', 'NM', 'OK', 'ND', 'CO', 'LA', 'PA', 'WV', 'WY', 'NV', 'CA', 'MT'];

export default function Onboarding() {
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>HitchWell</Text>
        <Text style={styles.lead}>A few defaults so logging a day takes one tap. You can change all of these later in Settings.</Text>

        <Text style={styles.label}>Your usual day rate ($)</Text>
        <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="number-pad" />

        <Text style={styles.label}>Home state</Text>
        <View style={styles.chipRow}>
          {Array.from(new Set([homeState, ...STATES])).map((s) => (
            <Chip key={s} label={s} selected={homeState === s} onPress={() => setHomeState(s)} />
          ))}
        </View>

        <Text style={styles.label}>Pay period</Text>
        <View style={styles.chipRow}>
          {PAY_PERIODS.map((p) => (
            <Chip key={p.key} label={p.label} selected={payPeriod === p.key} onPress={() => setPayPeriod(p.key)} />
          ))}
        </View>
        <Text style={styles.note}>This sets how your expense reports group hours, mileage, and receipts.</Text>

        <Pressable style={styles.btn} onPress={start}>
          <Text style={styles.btnText}>Get started</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 22, paddingTop: 40, paddingBottom: 40 },
  brand: { fontSize: 28, fontWeight: '500', color: colors.ink },
  lead: { fontSize: 14, color: colors.muted, lineHeight: 20, marginTop: 8, marginBottom: 8 },
  label: { fontSize: 12, color: colors.muted, marginTop: 22, marginBottom: 8 },
  input: { height: 46, borderWidth: 0.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { fontSize: 11, color: colors.muted, marginTop: 8 },
  btn: { backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 34 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
