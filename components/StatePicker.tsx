import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/colors';
import { OILFIELD_STATES, ALL_STATES, STATE_NAMES } from '../lib/states';

// Dropdown state picker. The field shows the current state; tapping opens a
// full-screen sheet listing oilfield states first, then all states A-Z.
export function StatePicker({
  value,
  onChange,
  pinned,
}: {
  value: string;
  onChange: (s: string) => void;
  pinned?: string;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  const rest = [...ALL_STATES].sort().filter((s) => !OILFIELD_STATES.includes(s));

  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
  };

  const RowItem = ({ code }: { code: string }) => {
    const on = value === code;
    return (
      <Pressable
        onPress={() => pick(code)}
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingVertical: 13, paddingHorizontal: 16,
          borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2,
          backgroundColor: on ? t.surface : 'transparent',
        }}
      >
        <Text style={{ fontSize: 15, color: t.ink, fontWeight: on ? '500' : '400' }}>
          {code}  <Text style={{ color: t.muted, fontWeight: '400' }}>{STATE_NAMES[code]}</Text>
        </Text>
        {on && <Ionicons name="checkmark" size={17} color={t.ink} />}
      </Pressable>
    );
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8,
          paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: t.bg,
        }}
        accessibilityRole="button"
      >
        <Text style={{ fontSize: 16, color: value ? t.ink : t.faint }}>
          {value ? `${value} — ${STATE_NAMES[value] ?? ''}` : 'Select State'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={t.faint} />
      </Pressable>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: t.bg }}>
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: t.ink }}>State</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <Ionicons name="close" size={20} color={t.ink} />
            </Pressable>
          </View>
          <ScrollView>
            <Text style={{ fontSize: 11, color: t.faint, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
              Oilfield States
            </Text>
            {Array.from(new Set([...(pinned ? [pinned] : []), ...OILFIELD_STATES])).map((c) => (
              <RowItem key={c} code={c} />
            ))}
            <Text style={{ fontSize: 11, color: t.faint, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 4 }}>
              All States
            </Text>
            {rest.map((c) => (
              <RowItem key={c} code={c} />
            ))}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
