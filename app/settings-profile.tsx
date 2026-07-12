import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/colors';
import { Chip } from '../components/Chip';
import { StatePicker } from '../components/StatePicker';
import { useStore } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsProfile() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const router = useRouter();
  const { profile, setProfile } = useStore();

  const [name, setName] = useState(profile.name);
  const [homeState, setHomeState] = useState(profile.homeState);

  const save = () => {
    setProfile({ name: name.trim(), homeState });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={s.label}>Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="optional" placeholderTextColor={t.faint} />

        <Text style={s.label}>Employment</Text>
        <View style={s.chipRow}>
          <Chip label="1099 / Contractor" selected={profile.employmentType !== 'w2'} onPress={() => setProfile({ employmentType: '1099' })} />
          <Chip label="W-2" selected={profile.employmentType === 'w2'} onPress={() => setProfile({ employmentType: 'w2' })} />
        </View>
        <Text style={s.note}>W-2 employees cannot deduct unreimbursed expenses federally, so those costs are labeled out of pocket. Applies immediately.</Text>

        <Text style={s.label}>Home State</Text>
        <StatePicker value={homeState} onChange={setHomeState} />

        <Text style={s.note}>Address, phone, and email for invoices live under Business Details.</Text>

        <Pressable style={s.saveBtn} onPress={save}><Text style={s.saveText}>Save</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
