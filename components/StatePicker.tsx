import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/colors';
import { OILFIELD_STATES, PICKER_STATES } from '../lib/states';

// Compact all-states picker. Shows the oilfield states (plus home/current
// selection) as a dense grid; "all states" expands to the full 51.
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
  const [expanded, setExpanded] = useState(false);

  const short = Array.from(new Set([...(pinned ? [pinned] : []), ...(value ? [value] : []), ...OILFIELD_STATES]));
  const list = expanded ? PICKER_STATES : short;

  return (
    <View>
      <View style={styles.grid}>
        {list.map((s) => {
          const on = value === s;
          return (
            <Pressable
              key={s}
              onPress={() => onChange(s)}
              style={{
                width: 44, paddingVertical: 8, alignItems: 'center', borderRadius: 6,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: on ? t.ink : t.border,
                backgroundColor: on ? t.ink : 'transparent',
              }}
            >
              <Text style={{ fontSize: 13, color: on ? t.onInk : t.ink, fontWeight: on ? '500' : '400' }}>{s}</Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setExpanded((e) => !e)} style={{ paddingVertical: 8, paddingHorizontal: 10, justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, color: t.faint }}>{expanded ? 'fewer ↑' : 'all states ↓'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
