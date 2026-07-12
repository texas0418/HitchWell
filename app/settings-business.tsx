import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme/colors';
import { useStore } from '../lib/store';
import { makeSettingsStyles } from '../lib/settingsStyles';

const fmtPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
};

export default function SettingsBusiness() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const router = useRouter();
  const { profile, setProfile } = useStore();

  const [bizName, setBizName] = useState(profile.businessName);
  const [bizAddress, setBizAddress] = useState(profile.businessAddress);
  const [bizPhone, setBizPhone] = useState(profile.businessPhone);
  const [bizEmail, setBizEmail] = useState(profile.businessEmail);
  const [payInstr, setPayInstr] = useState(profile.paymentInstructions);

  const save = () => {
    setProfile({
      businessName: bizName.trim(),
      businessAddress: bizAddress.trim(),
      businessPhone: bizPhone.trim(),
      businessEmail: bizEmail.trim(),
      paymentInstructions: payInstr.trim(),
    });
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={s.lead}>Appears on the From block of your invoices. All optional.</Text>

        <Text style={s.label}>Business Name</Text>
        <TextInput style={s.input} value={bizName} onChangeText={setBizName} placeholder="falls back to your name" placeholderTextColor={t.faint} />

        <Text style={s.label}>Address</Text>
        <TextInput style={[s.input, s.multiline]} value={bizAddress} onChangeText={setBizAddress} placeholder="street, city, state, zip" placeholderTextColor={t.faint} multiline />

        <Text style={s.label}>Phone</Text>
        <TextInput style={s.input} value={bizPhone} onChangeText={(v) => setBizPhone(fmtPhone(v))} keyboardType="phone-pad" placeholder="optional" placeholderTextColor={t.faint} />

        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} value={bizEmail} onChangeText={setBizEmail} keyboardType="email-address" autoCapitalize="none" placeholder="optional" placeholderTextColor={t.faint} />

        <Text style={s.label}>Payment Instructions</Text>
        <TextInput style={[s.input, s.multiline]} value={payInstr} onChangeText={setPayInstr} placeholder="e.g. ACH routing/account, or check payable to…" placeholderTextColor={t.faint} multiline />

        <Pressable style={s.saveBtn} onPress={save}><Text style={s.saveText}>Save</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
