import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme, AppColors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { ClientField } from '../components/ClientField';
import { ProjectField } from '../components/ProjectField';
import { DateField } from '../components/DateField';
import { NumField } from '../components/NumField';
import { StatePicker } from '../components/StatePicker';
import { useStore, DayType } from '../lib/store';
import { firstLastMie, mieForLocation, findArea } from '../lib/perdiem';
import { hitchStatus } from '../lib/hitch';
import { todayISO, addDays, longDate } from '../lib/format';

const TYPES: { key: DayType; label: string }[] = [
  { key: 'worked', label: 'Worked' },
  { key: 'travel', label: 'Travel' },
  { key: 'standby', label: 'Standby' },
  { key: 'off', label: 'Off' },
];

export default function EntryScreen() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; date?: string }>();
  const { dayEntries, profile, addDayEntry, updateDayEntry, removeDayEntry } = useStore();

  const existing = useMemo(() => dayEntries.find((d) => d.id === params.id), [dayEntries, params.id]);

  // Range mode logs one entry per day across [date, endDate]. Only for new
  // entries; edits are always single-day so each day stays individually
  // editable and deletable after a bulk log.
  const [range, setRange] = useState(false);
  const [date, setDate] = useState(existing?.date ?? params.date ?? todayISO());
  const [endDate, setEndDate] = useState(existing?.date ?? params.date ?? todayISO());
  const [type, setType] = useState<DayType>(existing?.type ?? 'worked');
  const [rate, setRate] = useState(String(existing?.rate ?? profile.defaultDayRate));
  const [state, setState] = useState(existing?.state ?? profile.homeState);
  const [location, setLocation] = useState(existing?.location ?? '');
  const [client, setClient] = useState(existing?.client ?? '');
  const [project, setProject] = useState(existing?.project ?? '');
  const [perDiem, setPerDiem] = useState(existing?.perDiem ?? true);
  const [perDiemAmt, setPerDiemAmt] = useState(String(existing?.perDiemAmount ?? profile.perDiemMie));

  const isOff = type === 'off';

  const buildPayload = (d: string) => ({
    date: d,
    type,
    rate: isOff ? 0 : Number(rate) || 0,
    state: isOff ? '' : state,
    location: location.trim(),
    client: client.trim() || undefined,
    project: project.trim() || undefined,
    perDiem: isOff ? false : perDiem,
    perDiemAmount: !isOff && perDiem ? Number(perDiemAmt) || 0 : undefined,
  });

  const save = () => {
    if (existing) {
      updateDayEntry(existing.id, buildPayload(date));
      router.back();
      return;
    }
    if (!range) {
      addDayEntry(buildPayload(date));
      router.back();
      return;
    }
    // Range save: one entry per day, skipping dates already logged.
    if (endDate < date) {
      Alert.alert('Check the dates', 'The end date is before the start date.');
      return;
    }
    const logged = new Set(dayEntries.map((e) => e.date));
    let added = 0;
    let skipped = 0;
    let d = date;
    let guard = 0;
    while (d <= endDate && guard < 120) {
      if (logged.has(d)) skipped++;
      else {
        addDayEntry(buildPayload(d));
        added++;
      }
      d = addDays(d, 1);
      guard++;
    }
    Alert.alert(
      'Days logged',
      `Logged ${added} day${added === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} already logged` : ''}. Each day can be edited or deleted on the calendar.`
    );
    router.back();
  };

  const del = () => {
    if (existing) removeDayEntry(existing.id);
    router.back();
  };

  const rangeDays = useMemo(() => {
    if (!range || endDate < date) return 0;
    let n = 0;
    let d = date;
    while (d <= endDate && n < 120) {
      n++;
      d = addDays(d, 1);
    }
    return n;
  }, [range, date, endDate]);

  // Quick-fill for the schedule: the hitch you're on now, or the next one.
  const hitchFill = useMemo(() => {
    const hs = hitchStatus(profile);
    if (!hs) return null;
    if (hs.phase === 'on') {
      const start = addDays(todayISO(), -(hs.dayInPhase - 1));
      return { label: 'This Hitch', start, end: addDays(start, hs.phaseLength - 1) };
    }
    const start = hs.nextChange;
    return { label: 'Next Hitch', start, end: addDays(start, (profile.hitchOnDays || 1) - 1) };
  }, [profile]);

  return (
    <ScrollView style={s.safe} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {!existing && (
        <View style={s.modeRow}>
          <Pressable style={[s.modeBtn, !range && s.modeOn]} onPress={() => setRange(false)}>
            <Text style={[s.modeText, !range && s.modeTextOn]}>Single Day</Text>
          </Pressable>
          <Pressable style={[s.modeBtn, range && s.modeOn]} onPress={() => setRange(true)}>
            <Text style={[s.modeText, range && s.modeTextOn]}>Date Range</Text>
          </Pressable>
        </View>
      )}

      <Text style={s.label}>{range && !existing ? 'First Day' : 'Date'}</Text>
      <DateField value={date} onChange={(d) => { setDate(d); if (endDate < d) setEndDate(d); }} />

      {range && !existing && (
        <>
          <Text style={s.label}>Last Day</Text>
          <DateField value={endDate} onChange={setEndDate} />
          {hitchFill && (
            <View style={[s.chipRow, { marginTop: 10 }]}>
              <Chip
                label={`${hitchFill.label} · ${longDate(hitchFill.start)} – ${longDate(hitchFill.end)}`}
                selected={date === hitchFill.start && endDate === hitchFill.end}
                onPress={() => { setDate(hitchFill.start); setEndDate(hitchFill.end); }}
              />
            </View>
          )}
          {rangeDays > 1 && (
            <Text style={s.rangeNote}>
              {rangeDays} days · {longDate(date)} to {longDate(endDate)} · same info applied to each, already-logged days skipped
            </Text>
          )}
        </>
      )}

      <Text style={s.label}>Type</Text>
      <View style={s.chipRow}>
        {TYPES.map((ty) => (
          <Chip
            key={ty.key}
            label={ty.label}
            selected={type === ty.key}
            onPress={() => {
              setType(ty.key);
              // Auto-fill the rate for the picked type (0 = same as day rate).
              if (ty.key === 'worked') setRate(String(profile.defaultDayRate));
              else if (ty.key === 'travel') setRate(String(profile.travelDayRate || profile.defaultDayRate));
              else if (ty.key === 'standby') setRate(String(profile.standbyDayRate || profile.defaultDayRate));
            }}
          />
        ))}
      </View>

      {!isOff && (
        <>
          <Text style={s.label}>Rate ($)</Text>
          <NumField value={rate} onChangeText={setRate} keyboardType="number-pad" placeholder="0" />

          <Text style={s.label}>State</Text>
          <StatePicker value={state} onChange={setState} pinned={profile.homeState} />

          <Text style={s.label}>Location</Text>
          <TextInput
            style={s.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Midland, TX"
            placeholderTextColor={t.faint}
          />

          <Text style={s.label}>Client / Staffing House</Text>
          <ClientField value={client} onChange={setClient} />

          <Text style={s.label}>Project</Text>
          <ProjectField value={project} onChange={setProject} />

          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Per Diem {range && rangeDays > 1 ? 'Days' : 'Day'}</Text>
            <Switch value={perDiem} onValueChange={setPerDiem} trackColor={{ true: t.accent }} />
          </View>

          {perDiem && (
            <View style={s.perDiemBox}>
              <Text style={s.label}>M&IE Amount ($/day)</Text>
              <NumField value={perDiemAmt} onChangeText={setPerDiemAmt} placeholder="0" />
              {(() => {
                const areaMie = mieForLocation(state, location, profile.perDiemMie);
                const area = findArea(state, location);
                return (
                  <>
                    <View style={[s.chipRow, { marginTop: 10 }]}>
                      <Chip
                        label={`Full $${areaMie}`}
                        selected={Number(perDiemAmt) === areaMie}
                        onPress={() => setPerDiemAmt(String(areaMie))}
                      />
                      <Chip
                        label={`Travel day 75% $${firstLastMie(areaMie)}`}
                        selected={Number(perDiemAmt) === firstLastMie(areaMie)}
                        onPress={() => setPerDiemAmt(String(firstLastMie(areaMie)))}
                      />
                    </View>
                    <Text style={s.perDiemNote}>
                      {area
                        ? `GSA rate for ${area.city}: $${areaMie} M&IE.`
                        : `Standard GSA M&IE is $${profile.perDiemMie}.`}
                      {range && rangeDays > 1
                        ? ' Applied to every day in the range; log travel days separately at 75%.'
                        : ' Use 75% for first and last travel days.'}
                    </Text>
                  </>
                );
              })()}
            </View>
          )}
        </>
      )}

      <Pressable style={s.saveBtn} onPress={save}>
        <Text style={s.saveText}>
          {existing ? 'Save Changes' : range && rangeDays > 1 ? `Log ${rangeDays} Days` : 'Save Day'}
        </Text>
      </Pressable>

      {existing && (
        <Pressable style={s.delBtn} onPress={del}>
          <Text style={s.delText}>Delete This Day</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 40 },

    modeRow: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, overflow: 'hidden' },
    modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    modeOn: { backgroundColor: t.ink },
    modeText: { fontSize: 13, color: t.muted },
    modeTextOn: { color: t.onInk, fontWeight: '500' },

    label: { fontSize: 12, color: t.muted, marginTop: 18, marginBottom: 8 },
    rangeNote: { fontSize: 11, color: t.faint, marginTop: 8 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    input: {
      height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8,
      paddingHorizontal: 13, fontSize: 16, color: t.ink, backgroundColor: t.bg,
    },

    switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
    switchLabel: { fontSize: 14, color: t.ink },

    perDiemBox: { marginTop: 6, paddingTop: 4 },
    perDiemNote: { fontSize: 11, color: t.muted, marginTop: 8 },

    saveBtn: { backgroundColor: t.ink, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
    saveText: { color: t.onInk, fontSize: 14, fontWeight: '500' },

    delBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 6 },
    delText: { color: t.danger, fontSize: 13 },
  });
