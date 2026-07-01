import React from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { usePrivacy } from '../context/PrivacyContext';

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
        {hidden && <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 4 },
});
