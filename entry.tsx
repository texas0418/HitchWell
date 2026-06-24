import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { ClientField } from '../components/ClientField';
import { DateField } from '../components/DateField';
import { useStore, DayType } from '../lib/store';
import { firstLastMie } from '../lib/perdiem';
import { todayISO } from '../lib/format';

const TYPES: { key: DayType; label: string }[] = [
  { key: 'worked', label: 'Worked' },
  { key: 'travel', label: 'Travel' },
  { key: 'standby', label: 'Standby' },
  { key: 'off', label: 'Off' },
];

const STATES = ['TX', 'NM', 'OK', 'ND', 'CO', 'LA', 'PA', 'WV', 'WY', 'NV', 'CA', 'MT'];

export default function EntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { dayEntries, profile, addDayEntry, updateDayEntry, removeDayEntry } = useStore();

  const existing = useMemo(() => dayEntries.find((d) => d.id === params.id), [dayEntries, params.id]);

  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [type, setType] = useState<DayType>(existing?.type ?? 'worked');
  const [rate, setRate] = useState(String(existing?.rate ?? profile.defaultDayRate));
  const [state, setState] = useState(existing?.state ?? profile.homeState);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [client, setClient] = useState(existing?.client ?? '');
  const [perDiem, setPerDiem] = useState(existing?.perDiem ?? true);
  const [perDiemAmt, setPerDiemAmt] = useState(String(existing?.perDiemAmount ?? profile.perDiemMie));

  const isOff = type === 'off';
  const stateOptions = Array.from(new Set([profile.homeState, ...STATES])).filter(Boolean);

  const save = () => {
    const payload = {
      date,
      type,
      rate: isOff ? 0 : Number(rate) || 0,
      state: isOff ? '' : state,
      location: location.trim(),
      client: client.trim() || undefined,
      perDiem: isOff ? false : perDiem,
      perDiemAmount: !isOff && perDiem ? Number(perDiemAmt) || 0 : undefined,
    };
    if (existing) updateDayEntry(existing.id, payload);
    else addDayEntry(payload);
    router.back();
  };

  const del = () => {
    if (existing) removeDayEntry(existing.id);
    router.back();
  };

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Date</Text>
      <DateField value={date} onChange={setDate} />

      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {TYPES.map((t) => (
          <Chip key={t.key} label={t.label} selected={type === t.key} onPress={() => setType(t.key)} />
        ))}
      </View>

      {!isOff && (
        <>
          <Text style={styles.label}>Rate ($)</Text>
          <TextInput
            style={styles.input}
            value={rate}
            onChangeText={setRate}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.faint}
          />

          <Text style={styles.label}>State</Text>
          <View style={styles.chipRow}>
            {stateOptions.map((s) => (
              <Chip key={s} label={s} selected={state === s} onPress={() => setState(s)} />
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Midland, TX"
            placeholderTextColor={colors.faint}
          />

          <Text style={styles.label}>Client / staffing house</Text>
          <ClientField value={client} onChange={setClient} />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Per diem day</Text>
            <Switch value={perDiem} onValueChange={setPerDiem} trackColor={{ true: colors.accent }} />
          </View>

          {perDiem && (
            <View style={styles.perDiemBox}>
              <Text style={styles.label}>M&IE amount ($)</Text>
              <TextInput
                style={styles.input}
                value={perDiemAmt}
                onChangeText={setPerDiemAmt}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.faint}
              />
              <View style={styles.chipRow}>
                <Chip
                  label={`Full $${profile.perDiemMie}`}
                  selected={Number(perDiemAmt) === profile.perDiemMie}
                  onPress={() => setPerDiemAmt(String(profile.perDiemMie))}
                />
                <Chip
                  label={`Travel day 75% $${firstLastMie(profile.perDiemMie)}`}
                  selected={Number(perDiemAmt) === firstLastMie(profile.perDiemMie)}
                  onPress={() => setPerDiemAmt(String(firstLastMie(profile.perDiemMie)))}
                />
              </View>
              <Text style={styles.perDiemNote}>Defaults to your GSA M&IE rate. Use 75% for first and last travel days.</Text>
            </View>
          )}
        </>
      )}

      <Pressable style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveText}>{existing ? 'Save changes' : 'Save day'}</Text>
      </Pressable>

      {existing && (
        <Pressable style={styles.delBtn} onPress={del}>
          <Text style={styles.delText}>Delete</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingBottom: 40 },

  label: { fontSize: 12, color: colors.muted, marginTop: 18, marginBottom: 8 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dateText: { fontSize: 16, color: colors.ink, fontWeight: '500', minWidth: 130, textAlign: 'center' },
  todayBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.surface },
  todayText: { fontSize: 12, color: colors.accent },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  input: {
    height: 46, borderWidth: 0.5, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: 14, fontSize: 16, color: colors.ink, backgroundColor: colors.bg,
  },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  switchLabel: { fontSize: 15, color: colors.ink },

  perDiemBox: { marginTop: 6, paddingTop: 4 },
  perDiemNote: { fontSize: 11, color: colors.muted, marginTop: 8 },

  saveBtn: { backgroundColor: colors.ink, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 28 },
  saveText: { color: '#fff', fontSize: 15, fontWeight: '500' },

  delBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  delText: { color: colors.danger, fontSize: 14 },
});
