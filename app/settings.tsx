import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AppColors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { NumField } from '../components/NumField';
import { DateField } from '../components/DateField';
import { StatePicker } from '../components/StatePicker';
import { useStore, PayPeriod, PAY_PERIODS, Appearance } from '../lib/store';
import { clearAllReceipts } from '../lib/receipts';

export default function SettingsScreen() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const { profile, setProfile, loadSample, clearAll, clients, addClient, removeClient, appearance, setAppearance } = useStore();

  const [name, setName] = useState(profile.name);
  const [rate, setRate] = useState(String(profile.defaultDayRate));
  const [travelRate, setTravelRate] = useState(String(profile.travelDayRate || ''));
  const [standbyRate, setStandbyRate] = useState(String(profile.standbyDayRate || ''));
  const [mileageRate, setMileageRate] = useState(String(profile.mileageRate));
  const [taxPct, setTaxPct] = useState(String(Math.round(profile.taxSetAsidePct * 100)));
  const [homeState, setHomeState] = useState(profile.homeState);
  const [payPeriod, setPayPeriod] = useState<PayPeriod>(profile.payPeriod);
  const [termsDays, setTermsDays] = useState(String(profile.paymentTermsDays));
  const [perDiemMie, setPerDiemMie] = useState(String(profile.perDiemMie));
  const [hitchOn, setHitchOn] = useState(String(profile.hitchOnDays || ''));
  const [hitchOff, setHitchOff] = useState(String(profile.hitchOffDays || ''));
  const [hitchAnchor, setHitchAnchor] = useState(profile.hitchAnchor);
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
      travelDayRate: Number(travelRate) || 0,
      standbyDayRate: Number(standbyRate) || 0,
      mileageRate: Number(mileageRate) || 0,
      taxSetAsidePct: (Number(taxPct) || 0) / 100,
      homeState,
      payPeriod,
      paymentTermsDays: Number(termsDays) || 0,
      perDiemMie: Number(perDiemMie) || 0,
      hitchOnDays: Number(hitchOn) || 0,
      hitchOffDays: Number(hitchOff) || 0,
      hitchAnchor,
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
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="optional" placeholderTextColor={t.faint} />

        <Text style={s.label}>Default Day Rate ($)</Text>
        <NumField value={rate} onChangeText={setRate} keyboardType="number-pad" />

        <Text style={s.label}>Travel Day Rate ($)</Text>
        <NumField value={travelRate} onChangeText={setTravelRate} keyboardType="number-pad" placeholder="same as day rate" />

        <Text style={s.label}>Standby Day Rate ($)</Text>
        <NumField value={standbyRate} onChangeText={setStandbyRate} keyboardType="number-pad" placeholder="same as day rate" />
        <Text style={s.note}>Leave blank to use your default day rate. The log sheet fills the rate by day type.</Text>

        <Text style={s.label}>IRS Mileage Rate ($/mi)</Text>
        <NumField value={mileageRate} onChangeText={setMileageRate} />
        <Text style={s.note}>Verify the current rate with the IRS each tax year.</Text>

        <Text style={s.label}>Tax Set-Aside (%)</Text>
        <NumField value={taxPct} onChangeText={setTaxPct} keyboardType="number-pad" />
        <Text style={s.note}>A flat planning estimate, not a tax calculation. Confirm with your CPA.</Text>

        <Text style={s.label}>Home State</Text>
        <StatePicker value={homeState} onChange={setHomeState} />

        <Text style={s.label}>Appearance</Text>
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
        <Text style={s.note}>Applies immediately. System follows your phone setting.</Text>

        <Text style={s.label}>Pay Period</Text>
        <View style={s.chipRow}>
          {PAY_PERIODS.map((p) => (
            <Chip key={p.key} label={p.label} selected={payPeriod === p.key} onPress={() => setPayPeriod(p.key)} />
          ))}
        </View>

        <Text style={s.label}>Payment Terms (days to get paid)</Text>
        <NumField value={termsDays} onChangeText={setTermsDays} keyboardType="number-pad" />
        <Text style={s.note}>Days from billing to payment. Net-30 means 30.</Text>

        <Text style={s.label}>Per Diem M&IE ($/day)</Text>
        <NumField value={perDiemMie} onChangeText={setPerDiemMie} />
        <Text style={s.note}>GSA FY2026 standard CONUS is $68. Higher-cost areas differ; check gsa.gov/perdiem.</Text>

        <Text style={s.sectionTitle}>Hitch Schedule</Text>
        <Text style={s.note}>Days on / days off, and the first day of any hitch you know. Powers the calendar, days-home countdown, and year projection.</Text>

        <Text style={s.label}>Days On</Text>
        <NumField value={hitchOn} onChangeText={setHitchOn} keyboardType="number-pad" placeholder="28" />

        <Text style={s.label}>Days Off</Text>
        <NumField value={hitchOff} onChangeText={setHitchOff} keyboardType="number-pad" placeholder="14" />

        <Text style={s.label}>First Day of a Hitch</Text>
        {hitchAnchor ? (
          <>
            <DateField value={hitchAnchor} onChange={setHitchAnchor} />
            <Pressable onPress={() => setHitchAnchor('')}><Text style={[s.note, { color: t.danger }]}>Turn off schedule</Text></Pressable>
          </>
        ) : (
          <Pressable style={s.anchorBtn} onPress={() => setHitchAnchor(new Date().toISOString().slice(0, 10))}>
            <Text style={s.anchorText}>Set anchor date</Text>
          </Pressable>
        )}

        <Pressable style={s.saveBtn} onPress={save}><Text style={s.saveText}>Save</Text></Pressable>

        <Text style={s.sectionTitle}>Clients</Text>
        <Text style={s.note}>The list you pick from when logging days, expenses, and mileage. Reports group on these.</Text>
        {clients.length === 0 && <Text style={s.emptyClients}>No clients yet. Add one below or from any log screen.</Text>}
        {clients.map((c) => (
          <View key={c} style={s.clientRow}>
            <Text style={s.clientName}>{c}</Text>
            <Pressable hitSlop={8} onPress={() => removeClient(c)}>
              <Ionicons name="trash-outline" size={17} color={t.faint} />
            </Pressable>
          </View>
        ))}
        <View style={s.addClientRow}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            value={clientDraft}
            onChangeText={setClientDraft}
            placeholder="Add a client or staffing house"
            placeholderTextColor={t.faint}
            onSubmitEditing={addClientFromDraft}
            returnKeyType="done"
          />
          <Pressable style={s.addClientBtn} onPress={addClientFromDraft}><Text style={s.saveText}>Add</Text></Pressable>
        </View>

        <View style={s.devBox}>
          <Text style={s.devTitle}>Test Data</Text>
          <Pressable style={s.devBtn} onPress={() => loadSample()}><Text style={s.devBtnText}>Load Sample Data</Text></Pressable>
          <Pressable style={s.devBtn} onPress={confirmClear}><Text style={[s.devBtnText, { color: t.danger }]}>Clear All Data</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 40 },
    label: { fontSize: 12, color: t.muted, marginTop: 18, marginBottom: 8 },
    input: { height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, paddingHorizontal: 13, fontSize: 16, color: t.ink, backgroundColor: t.bg },
    note: { fontSize: 11, color: t.faint, marginTop: 6 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    saveBtn: { backgroundColor: t.ink, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
    saveText: { color: t.onInk, fontSize: 14, fontWeight: '500' },

    sectionTitle: { fontSize: 13, fontWeight: '500', color: t.ink, marginTop: 34 },
    emptyClients: { fontSize: 13, color: t.muted, marginTop: 10 },
    clientRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2 },
    clientName: { fontSize: 14, color: t.ink },
    addClientRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    addClientBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8, backgroundColor: t.ink },

    devBox: { marginTop: 32, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline, paddingTop: 16 },
    devTitle: { fontSize: 12, color: t.faint, marginBottom: 8 },
    devBtn: { paddingVertical: 12 },
    devBtnText: { fontSize: 14, color: t.ink },
    anchorBtn: { height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    anchorText: { fontSize: 14, color: t.accent },
  });
