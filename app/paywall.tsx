import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AppColors } from '../theme/colors';
import { useStore } from '../lib/store';
import { purchasePro, restorePro, canGate } from '../lib/purchases';

// One-time Pro unlock. Free tier logs everything; Pro exports it.
export default function PaywallScreen() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const proUnlocked = useStore((st) => st.proUnlocked);

  const buy = async () => {
    if (await purchasePro()) router.back();
  };

  const features = [
    'Monthly report PDF with receipts attached',
    'Numbered invoices, split by project',
    'Custom billing periods on every invoice',
    'One-time purchase. No subscription.',
  ];

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: true, title: 'HitchWell Pro' }} />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.head}>Get paid like a business.</Text>
        <Text style={s.lead}>Logging is free forever. Pro turns your month into the paperwork that gets you paid.</Text>

        <View style={s.list}>
          {features.map((f) => (
            <View key={f} style={s.featureRow}>
              <Ionicons name="checkmark" size={16} color={t.success} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {proUnlocked ? (
          <View style={s.ownedBox}>
            <Ionicons name="checkmark-circle" size={18} color={t.success} />
            <Text style={s.ownedText}>Pro is unlocked on this device.</Text>
          </View>
        ) : (
          <>
            {canGate() ? (
              <>
                <Pressable style={s.buyBtn} onPress={buy}>
                  <Text style={s.buyText}>Unlock Pro · $19.99</Text>
                </Pressable>
                <Pressable style={s.restoreBtn} onPress={() => restorePro()}>
                  <Text style={s.restoreText}>Restore Purchase</Text>
                </Pressable>
              </>
            ) : (
              <View style={s.disarmedBox}>
                <Text style={s.disarmedTitle}>Purchases aren't live in this build</Text>
                <Text style={s.note}>PDF exports are free until the store goes live. The unlock will appear here once it does.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 20, paddingBottom: 40 },
    head: { fontSize: 22, fontWeight: '500', color: t.ink, marginTop: 8 },
    lead: { fontSize: 14, color: t.muted, lineHeight: 20, marginTop: 8 },
    list: { marginTop: 22, gap: 12 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureText: { fontSize: 14, color: t.ink, flex: 1 },
    buyBtn: { backgroundColor: t.ink, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 30 },
    buyText: { color: t.onInk, fontSize: 15, fontWeight: '500' },
    restoreBtn: { paddingVertical: 14, alignItems: 'center' },
    restoreText: { fontSize: 13, color: t.accent },
    note: { fontSize: 11, color: t.faint, textAlign: 'center', marginTop: 4 },
    disarmedBox: { marginTop: 30, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 10, padding: 16 },
    disarmedTitle: { fontSize: 14, fontWeight: '500', color: t.ink, marginBottom: 4 },
    ownedBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 30, justifyContent: 'center' },
    ownedText: { fontSize: 14, color: t.ink },
  });
