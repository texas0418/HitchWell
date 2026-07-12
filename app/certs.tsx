import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AppColors } from '../theme/colors';
import { DateField } from '../components/DateField';
import { useStore } from '../lib/store';
import { certStatus, CertStatus } from '../lib/calc';
import { addDays, longDate, todayISO } from '../lib/format';

const statusColor = (t: AppColors): Record<CertStatus, string> => ({
  ok: t.success,
  soon: t.warnText,
  expired: t.danger,
});

export default function CertsScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const STATUS_COLOR = statusColor(t);
  const { certs, addCert, removeCert } = useStore();

  const [open, setOpen] = useState(certs.length === 0);
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState(addDays(todayISO(), 90));

  const sorted = [...certs].sort((a, b) => (a.expiry < b.expiry ? -1 : 1));

  const add = () => {
    if (!name.trim()) return;
    addCert({ name: name.trim(), expiry });
    setName(''); setExpiry(addDays(todayISO(), 90)); setOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Text style={styles.lead}>A lapsed ticket means you get turned away at the gate. Track expiries here.</Text>

        {open ? (
          <View style={styles.form}>
            <Text style={styles.label}>Cert or ticket</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. H2S Alive, TWIC, SafeLand" placeholderTextColor={t.faint} />
            <Text style={styles.label}>Expires</Text>
            <DateField value={expiry} onChange={setExpiry} />
            <Pressable style={styles.addBtn} onPress={add}><Text style={styles.addText}>Add</Text></Pressable>
          </View>
        ) : (
          <Pressable style={styles.openBtn} onPress={() => setOpen(true)}>
            <Ionicons name="add" size={18} color={t.ink} />
            <Text style={styles.openText}>Add cert or ticket</Text>
          </Pressable>
        )}

        {sorted.map((c) => {
          const { days, status } = certStatus(c);
          const color = STATUS_COLOR[status];
          const text = status === 'expired' ? `Expired ${Math.abs(days)}d ago` : `${days} days left`;
          return (
            <View key={c.id} style={styles.row}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{c.name}</Text>
                <Text style={[styles.rowSub, { color }]}>{text} · {longDate(c.expiry)}</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => removeCert(c.id)}><Ionicons name="trash-outline" size={18} color={t.faint} /></Pressable>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  content: { padding: 18, paddingBottom: 40 },
  lead: { fontSize: 13, color: t.muted, lineHeight: 19, marginBottom: 16 },

  form: { borderWidth: 0.5, borderColor: t.border, borderRadius: 14, padding: 14, marginBottom: 12 },
  label: { fontSize: 12, color: t.muted, marginTop: 12, marginBottom: 8 },
  input: { height: 44, borderWidth: 0.5, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: t.ink },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 0.5, borderColor: t.border },
  stepText: { fontSize: 13, color: t.ink },
  dateText: { flex: 1, textAlign: 'center', fontSize: 15, color: t.ink, fontWeight: '500' },
  addBtn: { backgroundColor: t.ink, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  addText: { color: t.onInk, fontSize: 15, fontWeight: '500' },

  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 0.5, borderColor: t.border, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 13, marginBottom: 12 },
  openText: { fontSize: 14, color: t.ink },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: 0.5, borderTopColor: t.hairline2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, color: t.ink },
  rowSub: { fontSize: 12, marginTop: 2 },
});
