import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/colors';
import { NumField } from '../components/NumField';
import { useStore } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsRates() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const router = useRouter();
  const { profile, setProfile } = useStore();

  const [rate, setRate] = useState(String(profile.defaultDayRate));
  const [travelRate, setTravelRate] = useState(String(profile.travelDayRate || ''));
  const [standbyRate, setStandbyRate] = useState(String(profile.standbyDayRate || ''));
  const [mileageRate, setMileageRate] = useState(String(profile.mileageRate));

  const save = () => {
    setProfile({
      defaultDayRate: Number(rate) || 0,
      travelDayRate: Number(travelRate) || 0,
      standbyDayRate: Number(standbyRate) || 0,
      mileageRate: Number(mileageRate) || 0,
    });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
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

        <Pressable style={s.saveBtn} onPress={save}><Text style={s.saveText}>Save</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
