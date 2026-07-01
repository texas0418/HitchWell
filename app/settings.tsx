import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { useStore, PayPeriod, PAY_PERIODS } from '../lib/store';
import { clearAllReceipts } from '../lib/receipts';

const STATES = ['TX', 'NM', 'OK', 'ND', 'CO', 'LA', 'PA', 'WV', 'WY', 'NV', 'CA', 'MT'];

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, setProfile, loadSample, clearAll, clients, addClient, removeClient } = useStore();

  const [name, setName] = useState(profile.name);
  const [rate, setRate] = useState(String(profile.defaultDayRate));
  const [mileageRate, setMileageRate] = useState(String(profile.mileageRate));
  const [taxPct, setTaxPct] = useState(String(Math.round(profile.taxSetAsidePct * 100)));
  const [homeState, setHomeState] = useState(profile.homeState);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>(profile.payPeriod);
  const [termsDays, setTermsDays] = useState(String(profile.paymentTermsDays));
  const [perDiemMie, setPerDiemMie] = useState(String(profile.perDiemMie));
  const [clientDraft, setClientDraft] = useState('');

  const addClientFromDraft = () => {
    const n = clientDraft.trim();
    if (!n) return;
    addClient(n);
    setClientDraft('');
  };

  const save = () => {
    setProfile({
      name: name.trim(),
      defaultDayRate: Number(rate) || 0,
      mileageRate: Number(mileageRate) || 0,
      taxSetAsidePct: (Number(taxPct) || 0) / 100,
      homeState,
      payPeriod,
      paymentTermsDays: Number(termsDays) || 0,
      perDiemMie: Number(perDiemMie) || 0,
    });
    router.back();
  };

  const confirmClear = () => {
    Alert.alert('Clear all data?', 'This removes every day, expense, mileage trip, and cert on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { clearAll(); clearAllReceipts(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="optional" placeholderTextColor={colors.faint} />

        <Text style={styles.label}>Default day rate ($)</Text>
        <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="number-pad" />

        <Text style={styles.label}>IRS mileage rate ($/mi)</Text>
        <TextInput style={styles.input} value={mileageRate} onChangeText={setMileageRate} keyboardType="decimal-pad" />
        <Text style={styles.note}>Verify the current rate with the IRS each tax year.</Text>

        <Text style={styles.label}>Tax set-aside (%)</Text>
        <TextInput style={styles.input} value={taxPct} onChangeText={setTaxPct} keyboardType="number-pad" />
        <Text style={styles.note}>A flat planning estimate, not a tax calculation. Confirm with your CPA.</Text>

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

        <Text style={styles.label}>Payment terms (days to get paid)</Text>
        <TextInput style={styles.input} value={termsDays} onChangeText={setTermsDays} keyboardType="number-pad" />
        <Text style={styles.note}>Days from billing to payment. Net-30 means 30.</Text>

        <Text style={styles.label}>Per diem M&IE ($/day)</Text>
        <TextInput style={styles.input} value={perDiemMie} onChangeText={setPerDiemMie} keyboardType="decimal-pad" />
        <Text style={styles.note}>GSA FY2026 standard CONUS is $68. Higher-cost areas differ; check gsa.gov/perdiem for your location.</Text>

        <Pressable style={styles.saveBtn} onPress={save}><Text style={styles.saveText}>Save</Text></Pressable>

        <Text style={styles.sectionTitle}>Clients</Text>
        <Text style={styles.note}>The list you pick from when logging days, expenses, and mileage. Reports group on these.</Text>
        {clients.length === 0 && <Text style={styles.emptyClients}>No clients yet. Add one below or from any log screen.</Text>}
        {clients.map((c) => (
          <View key={c} style={styles.clientRow}>
            <Text style={styles.clientName}>{c}</Text>
            <Pressable hitSlop={8} onPress={() => removeClient(c)}>
              <Ionicons name="trash-outline" size={18} color={colors.faint} />
            </Pressable>
          </View>
        ))}
        <View style={styles.addClientRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={clientDraft}
            onChangeText={setClientDraft}
            placeholder="Add a client or staffing house"
            placeholderTextColor={colors.faint}
            onSubmitEditing={addClientFromDraft}
            returnKeyType="done"
          />
          <Pressable style={styles.addClientBtn} onPress={addClientFromDraft}><Text style={styles.saveText}>Add</Text></Pressable>
        </View>

        <View style={styles.devBox}>
          <Text style={styles.devTitle}>Test data</Text>
          <Pressable style={styles.devBtn} onPress={() => loadSample()}><Text style={styles.devBtnText}>Load sample data</Text></Pressable>
          <Pressable style={styles.devBtn} onPress={confirmClear}><Text style={[styles.devBtnText, { color: colors.danger }]}>Clear all data</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 12, color: colors.muted, marginTop: 18, marginBottom: 8 },
  input: { height: 46, borderWidth: 0.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  note: { fontSize: 11, color: colors.muted, marginTop: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  saveBtn: { backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  sectionTitle: { fontSize: 14, fontWeight: '500', color: colors.ink, marginTop: 34 },
  emptyClients: { fontSize: 13, color: colors.muted, marginTop: 10 },
  clientRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: colors.hairline2 },
  clientName: { fontSize: 15, color: colors.ink },
  addClientRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addClientBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10, backgroundColor: colors.ink },

  devBox: { marginTop: 32, borderTopWidth: 0.5, borderTopColor: colors.hairline, paddingTop: 16 },
  devTitle: { fontSize: 12, color: colors.muted, marginBottom: 8 },
  devBtn: { paddingVertical: 12 },
  devBtnText: { fontSize: 15, color: colors.ink },
});
