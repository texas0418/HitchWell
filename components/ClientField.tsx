import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme, AppColors } from '../theme/colors';
import { Chip } from './Chip';
import { useStore } from '../lib/store';

// Pick a client from the canonical list, or add a new one inline.
// value is '' when no client is set. Reporting groups on these names,
// so they stay canonical instead of free text.
export function ClientField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const clients = useStore((s) => s.clients);
  const addClient = useStore((s) => s.addClient);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const commit = () => {
    const n = draft.trim();
    if (n) {
      addClient(n);
      onChange(n);
    }
    setDraft('');
    setAdding(false);
  };

  return (
    <View>
      <View style={styles.row}>
        {clients.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={value === c}
            onPress={() => onChange(value === c ? '' : c)}
          />
        ))}
        <Pressable style={styles.addChip} onPress={() => setAdding((a) => !a)}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {adding && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Client or staffing house"
            placeholderTextColor={t.faint}
            autoFocus
            onSubmitEditing={commit}
            returnKeyType="done"
          />
          <Pressable style={styles.saveBtn} onPress={commit}>
            <Text style={styles.saveText}>Add</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const makeStyles = (t: AppColors) => StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  addChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 0.5, borderColor: t.border, borderStyle: 'dashed' },
  addText: { fontSize: 13, color: t.muted },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, height: 44, borderWidth: 0.5, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: t.ink },
  saveBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10, backgroundColor: t.ink },
  saveText: { color: t.onInk, fontSize: 14, fontWeight: '500' },
});
