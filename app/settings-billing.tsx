import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/colors';
import { Chip } from '../components/Chip';
import { NumField } from '../components/NumField';
import { useStore, PayPeriod, PAY_PERIODS } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsBilling() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const router = useRouter();
  const { profile, setProfile } = useStore();

  const [payPeriod, setPayPeriod] = useState<PayPeriod>(profile.payPeriod);
  const [termsDays, setTermsDays] = useState(String(profile.paymentTermsDays));
  const [perDiemMie, setPerDiemMie] = useState(String(profile.perDiemMie));
  const [taxPct, setTaxPct] = useState(String(Math.round(profile.taxSetAsidePct * 100)));

  const save = () => {
    setProfile({
      payPeriod,
      paymentTermsDays: Number(termsDays) || 0,
      perDiemMie: Number(perDiemMie) || 0,
      taxSetAsidePct: (Number(taxPct) || 0) / 100,
    });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>Pay Period</Text>
        <View style={s.chipRow}>
          {PAY_PERIODS.map((p) => (
            <Chip key={p.key} label={p.label} selected={payPeriod === p.key} onPress={() => setPayPeriod(p.key)} />
          ))}
        </View>

        <Text style={s.label}>Billing Period Ends</Text>
        <View style={s.chipRow}>
          <Chip label="Last Day of Month" selected={(profile.billingCycle || 'calendar') === 'calendar'} onPress={() => setProfile({ billingCycle: 'calendar' })} />
          <Chip label="Last Sunday of Month" selected={profile.billingCycle === 'last-sunday'} onPress={() => setProfile({ billingCycle: 'last-sunday' })} />
        </View>
        <Text style={s.note}>Cutoff for reports and invoices. Each invoice can still override its dates. Applies immediately.</Text>

        <Text style={s.label}>Payment Terms (days to get paid)</Text>
        <NumField value={termsDays} onChangeText={setTermsDays} keyboardType="number-pad" />
        <Text style={s.note}>Days from billing to payment. Net-30 means 30.</Text>

        <Text style={s.label}>Per Diem M&IE ($/day)</Text>
        <NumField value={perDiemMie} onChangeText={setPerDiemMie} />
        <Text style={s.note}>GSA FY2026 standard CONUS is $68. Higher-cost areas differ; check gsa.gov/perdiem.</Text>

        <Text style={s.label}>Tax Set-Aside (%)</Text>
        <NumField value={taxPct} onChangeText={setTaxPct} keyboardType="number-pad" />
        <Text style={s.note}>A flat planning estimate, not a tax calculation. Confirm with your CPA.</Text>

        <Pressable style={s.saveBtn} onPress={save}><Text style={s.saveText}>Save</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
