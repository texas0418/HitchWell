import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { usePrivacy } from '../context/PrivacyContext';

// Renders a sensitive monetary value. When privacy is on, a BlurView is
// overlaid on the text so the number is obscured but layout is preserved.
// Tapping anywhere on the value toggles reveal/hide (reveal asks Face ID).
//
// Note: blur hides the digits but the value's WIDTH is still visible, which
// is a partial tell on large numbers. If you want stronger privacy later,
// swap the rendered text for a dotted mask (e.g. "$ ••,•••") when hidden.

type Props = {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  intensity?: number;
};

export function AmountText({ children, style, intensity = 24 }: Props) {
  const { hidden, toggle } = usePrivacy();

  return (
    <Pressable onPress={toggle} hitSlop={6}>
      <View style={styles.wrap}>
        <Text style={style}>{children}</Text>
        {hidden && (
          <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 4,
  },
});
