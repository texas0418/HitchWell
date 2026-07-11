import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, AppColors } from '../../theme/colors';
import { AmountText } from '../../components/AmountText';
import { useStore, DayEntry } from '../../lib/store';
import { money, todayISO, monthLabel, addMonths, toISODate } from '../../lib/format';

// Calendar-first log. The grid is the primary surface: days colored by status,
// tap a logged day to edit it, tap an empty day to log it.

export default function CalendarScreen() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const router = useRouter();
  const { dayEntries } = useStore();

  const now = new Date();
  const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const today = todayISO();

  const byDate = useMemo(() => {
    const m = new Map<string, DayEntry>();
    for (const d of dayEntries) m.set(d.date, d);
    return m;
  }, [dayEntries]);

  const grid = useMemo(() => {
    const first = new Date(ym.year, ym.month, 1);
    const lead = first.getDay();
    const daysInMonth = new Date(ym.year, ym.month + 1, 0).getDate();
    const cells: { iso: string; day: number }[] = [];
    for (let i = 0; i < lead; i++) cells.push({ iso: '', day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ iso: toISODate(new Date(ym.year, ym.month, d)), day: d });
    }
    return cells;
  }, [ym]);

  const monthEntries = useMemo(
    () =>
      dayEntries
        .filter((d) => {
          const dd = new Date(d.date + 'T00:00:00');
          return dd.getFullYear() === ym.year && dd.getMonth() === ym.month;
        })
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [dayEntries, ym]
  );

  const workedCount = monthEntries.filter((d) => d.type !== 'off').length;
  const income = monthEntries.reduce((sum, d) => sum + (d.rate || 0), 0);

  const cellColor = (e?: DayEntry): { bg: string; fg: string; border: string } => {
    if (!e) return { bg: 'transparent', fg: t.muted, border: 'transparent' };
    switch (e.type) {
      case 'worked': return { bg: t.success, fg: t.onInk, border: t.success };
      case 'travel': return { bg: t.accent, fg: t.onInk, border: t.accent };
      case 'standby': return { bg: t.warn, fg: t.onInk, border: t.warn };
      case 'off': return { bg: t.surface, fg: t.faint, border: t.surface };
    }
  };

  const open = (cell: { iso: string; day: number }) => {
    if (!cell.iso) return;
    const e = byDate.get(cell.iso);
    if (e) router.push(`/entry?id=${e.id}`);
    else router.push(`/entry?date=${cell.iso}`);
  };

  const typeLabel = (e: DayEntry) =>
    e.type === 'worked' ? 'worked' : e.type === 'travel' ? 'travel' : e.type === 'standby' ? 'standby' : 'off';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.headRow}>
          <Pressable hitSlop={10} onPress={() => setYm((c) => addMonths(c.year, c.month, -1))}>
            <Ionicons name="chevron-back" size={20} color={t.ink} />
          </Pressable>
          <Text style={s.month}>{monthLabel(ym.year, ym.month)}</Text>
          <Pressable hitSlop={10} onPress={() => setYm((c) => addMonths(c.year, c.month, 1))}>
            <Ionicons name="chevron-forward" size={20} color={t.ink} />
          </Pressable>
        </View>

        <View style={s.statRow}>
          <Text style={s.stat}>{workedCount} days</Text>
          <AmountText style={s.stat}>{money(income)}</AmountText>
        </View>

        <View style={s.weekRow}>
          {['s', 'm', 't', 'w', 't', 'f', 's'].map((d, i) => (
            <Text key={i} style={s.weekDay}>{d}</Text>
          ))}
        </View>

        <View style={s.grid}>
          {grid.map((cell, i) => {
            if (!cell.iso) return <View key={i} style={s.cell} />;
            const e = byDate.get(cell.iso);
            const c = cellColor(e);
            const isToday = cell.iso === today;
            return (
              <Pressable
                key={i}
                style={[s.cell, { backgroundColor: c.bg, borderColor: isToday ? t.ink : c.border }]}
                onPress={() => open(cell)}
              >
                <Text style={[s.cellText, { color: c.fg }]}>{cell.day}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.legend}>
          <Legend t={t} color={t.success} label="worked" />
          <Legend t={t} color={t.accent} label="travel" />
          <Legend t={t} color={t.warn} label="standby" />
          <Legend t={t} color={t.surface} label="off" outline />
        </View>

        {monthEntries.length === 0 ? (
          <Text style={s.empty}>nothing logged this month · tap a day to log it</Text>
        ) : (
          monthEntries.map((e) => (
            <Pressable key={e.id} style={s.row} onPress={() => router.push(`/entry?id=${e.id}`)}>
              <Text style={s.rowDate}>{e.date.slice(5)}</Text>
              <Text style={s.rowMain} numberOfLines={1}>
                {typeLabel(e)}
                {e.state ? ` · ${e.state}` : ''}
                {e.client ? ` · ${e.client}` : ''}
              </Text>
              <AmountText style={s.rowAmt}>{money(e.rate)}</AmountText>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ t, color, label, outline }: { t: AppColors; color: string; label: string; outline?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <View
        style={{
          width: 9, height: 9, borderRadius: 2, backgroundColor: color,
          borderWidth: outline ? StyleSheet.hairlineWidth : 0, borderColor: t.border,
        }}
      />
      <Text style={{ fontSize: 11, color: t.muted }}>{label}</Text>
    </View>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 40 },

    headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
    month: { fontSize: 17, fontWeight: '500', color: t.ink },

    statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline },
    stat: { fontSize: 13, color: t.muted },

    weekRow: { flexDirection: 'row', paddingTop: 12, paddingBottom: 6 },
    weekDay: { flex: 1, textAlign: 'center', fontSize: 11, color: t.faint },

    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: {
      width: `${100 / 7}%` as unknown as number,
      aspectRatio: 1.15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: 'transparent',
      marginVertical: 1,
    },
    cellText: { fontSize: 12 },

    legend: { flexDirection: 'row', gap: 14, paddingTop: 10, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline },

    empty: { fontSize: 13, color: t.muted, paddingTop: 18, textAlign: 'center' },

    row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2 },
    rowDate: { fontSize: 12, color: t.faint, width: 42 },
    rowMain: { flex: 1, fontSize: 13, color: t.ink },
    rowAmt: { fontSize: 13, color: t.ink },
  });
