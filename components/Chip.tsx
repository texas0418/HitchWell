import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/colors';

// Terminal-style chip: squared corners, hairline border, ink fill when selected.
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 13,
        borderRadius: 6,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: selected ? t.ink : t.border,
        backgroundColor: selected ? t.ink : 'transparent',
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={{ fontSize: 13, color: selected ? t.onInk : t.ink, fontWeight: selected ? '500' : '400' }}>
        {label}
      </Text>
    </Pressable>
  );
}
