import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AmountText } from '../components/AmountText';
import { ClientField } from '../components/ClientField';
import { useStore } from '../lib/store';
import * as calc from '../lib/calc';
import { money, num, todayISO, longDate } from '../lib/format';

export default function MileageScreen() {
  const { mileage, profile, addMileage, removeMileage } = useStore();
  const year = new Date().getFullYear();
  const totalMiles = calc.totalMileage(mileage, year);
  const deduction = calc.mileageDeduction(totalMiles, profile);

  const [open, setOpen] = useState(mileage.length === 0);
  const [miles, setMiles] = useState('');
  const [purpose, setPurpose] = useState('');
  const [client, setClient] = useState('');

  const sorted = [...mileage].sort((a, b) => (a.date < b.date ? 1 : -1));

  const add = () => {
    const m = Number(miles) || 0;
    if (m <= 0) return;
    addMileage({ date: todayISO(), miles: m, purpose: purpose.trim(), client: client || undefined });
    setMiles(''); setPurpose(''); setClient(''); setOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.summary}>
          <View>
            <Text style={styles.sumLabel}>{year} miles</Text>
            <Text style={styles.sumValue}>{num(totalMiles)}</Text>
          </View>
          <View>
            <Text style={styles.sumLabel}>Est. deduction</Text>
            <AmountText style={styles.sumValue}>{money(deduction)}</AmountText>
          </View>
        </View>
        <Text style={styles.rateNote}>At ${profile.mileageRate.toFixed(2)}/mi. Verify the current IRS rate each year in Settings.</Text>

        {open ? (
          <View style={styles.form}>
            <Text style={styles.label}>Miles</Text>
            <TextInput style={styles.input} value={miles} onChangeText={setMiles} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>Purpose</Text>
            <TextInput style={styles.input} value={purpose} onChangeText={setPurpose} placeholder="e.g. home to location" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>Client / job</Text>
            <ClientField value={client} onChange={setClient} />
            <Pressable style={styles.addBtn} onPress={add}><Text style={styles.addText}>Add trip</Text></Pressable>
          </View>
        ) : (
          <Pressable style={styles.openBtn} onPress={() => setOpen(true)}>
            <Ionicons name="add" size={18} color={colors.ink} />
            <Text style={styles.openText}>Add trip</Text>
          </Pressable>
        )}

        {sorted.map((m) => (
          <View key={m.id} style={styles.row}>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{num(m.miles)} mi{m.purpose ? ` · ${m.purpose}` : ''}</Text>
              <Text style={styles.rowSub}>{[longDate(m.date), m.client].filter(Boolean).join(' · ')}</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => removeMileage(m.id)}><Ionicons name="trash-outline" size={18} color={colors.faint} /></Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },

  summary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
  sumLabel: { fontSize: 12, color: colors.muted },
  sumValue: { fontSize: 20, fontWeight: '500', color: colors.ink, marginTop: 2 },
  rateNote: { fontSize: 12, color: colors.muted, marginTop: 8, marginBottom: 16 },

  form: { borderWidth: 0.5, borderColor: colors.border, borderRadius: 14, padding: 14, marginBottom: 12 },
  label: { fontSize: 12, color: colors.muted, marginTop: 12, marginBottom: 8 },
  input: { height: 44, borderWidth: 0.5, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: colors.ink },
  addBtn: { backgroundColor: colors.ink, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  addText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 0.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 13, marginBottom: 12 },
  openText: { fontSize: 14, color: colors.ink },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: 0.5, borderTopColor: colors.hairline2 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 14, color: colors.ink },
  rowSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
});
