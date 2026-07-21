import React from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/colors';

let seq = 0;

// Numeric TextInput with a Done bar above the iOS number pad (which has no
// return key). Android number pads have their own done key, so it's iOS-only.
export function NumField(props: TextInputProps) {
  const t = useTheme();
  const idRef = React.useRef(`numfield-${++seq}`);
  const base = {
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.border,
    borderRadius: 8,
    paddingHorizontal: 13,
    fontSize: 16,
    color: t.ink,
    backgroundColor: t.bg,
  };
  return (
    <>
      <TextInput
        placeholderTextColor={t.faint}
        keyboardType="decimal-pad"
        {...props}
        style={[base, props.style]}
        // eslint-disable-next-line react-hooks/refs -- tracked in #6
        inputAccessoryViewID={Platform.OS === 'ios' ? idRef.current : undefined}
      />
      {Platform.OS === 'ios' && (
        // eslint-disable-next-line react-hooks/refs -- tracked in #6
        <InputAccessoryView nativeID={idRef.current}>
          <View style={{ backgroundColor: t.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.hairline, alignItems: 'flex-end' }}>
            <Pressable onPress={Keyboard.dismiss} hitSlop={8} style={{ paddingVertical: 10, paddingHorizontal: 18 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: t.accent }}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
}
