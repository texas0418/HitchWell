import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/colors';
import { NumField } from '../components/NumField';
import { DateField } from '../components/DateField';
import { useStore } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsHitch() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const router = useRouter();
  const { profile, setProfile } = useStore();

  const [hitchOn, setHitchOn] = useState(String(profile.hitchOnDays || ''));
  const [hitchOff, setHitchOff] = useState(String(profile.hitchOffDays || ''));
  const [hitchAnchor, setHitchAnchor] = useState(profile.hitchAnchor);

  const save = () => {
    setProfile({
      hitchOnDays: Number(hitchOn) || 0,
      hitchOffDays: Number(hitchOff) || 0,
      hitchAnchor,
    });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={s.lead}>Days on / days off, and the first day of any hitch you know. Powers the calendar, days-home countdown, and year projection.</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}
