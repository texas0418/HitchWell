import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, AppColors } from '../theme/colors';
import { fromISO, toISODate, longDate } from '../lib/format';

// Wraps the native date picker. iOS shows a compact tappable control inline.
// Android opens the system dialog when the field is pressed.
export function DateField({
  value,
  onChange,
}: {
  value: string;      // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
}) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const [show, setShow] = useState(false);
  const date = fromISO(value);

  const handle = (_event: unknown, picked?: Date) => {
    if (Platform.OS !== 'ios') setShow(false);
    if (picked) onChange(toISODate(picked));
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosRow}>
        <DateTimePicker value={date} mode="date" display="compact" onChange={handle} />
      </View>
    );
  }

  return (
    <>
      <Pressable style={styles.field} onPress={() => setShow(true)}>
        <Text style={styles.fieldText}>{longDate(value)}</Text>
      </Pressable>
      {show && <DateTimePicker value={date} mode="date" display="default" onChange={handle} />}
    </>
  );
}

const makeStyles = (t: AppColors) => StyleSheet.create({
  iosRow: { alignItems: 'flex-start' },
  field: { height: 46, borderWidth: 0.5, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  fieldText: { fontSize: 16, color: t.ink },
});
