import { StyleSheet } from 'react-native';
import { AppColors } from '../theme/colors';

// Shared styles for the settings sub-screens.
export const makeSettingsStyles = (t: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, paddingBottom: 48 },
    label: { fontSize: 12, color: t.muted, marginTop: 16, marginBottom: 8 },
    input: { height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, paddingHorizontal: 13, fontSize: 16, color: t.ink, backgroundColor: t.bg },
    note: { fontSize: 11, color: t.faint, marginTop: 6, lineHeight: 16 },
    lead: { fontSize: 12, color: t.muted, lineHeight: 17, marginTop: 4 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    multiline: { height: 88, paddingTop: 12, textAlignVertical: 'top' },
    saveBtn: { backgroundColor: t.ink, borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
    saveText: { color: t.onInk, fontSize: 14, fontWeight: '500' },
    listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: t.hairline2 },
    listName: { fontSize: 14, color: t.ink },
    emptyList: { fontSize: 13, color: t.muted, marginTop: 10 },
    addRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    addBtn: { paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8, backgroundColor: t.ink },
    actionBtn: { paddingVertical: 12 },
    actionText: { fontSize: 14, color: t.ink },
    anchorBtn: { height: 44, borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    anchorText: { fontSize: 14, color: t.accent },
    sectionTitle: { fontSize: 13, fontWeight: '500', color: t.ink, marginTop: 26, marginBottom: 2 },
  });
