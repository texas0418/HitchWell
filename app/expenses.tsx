import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme, AppColors } from '../theme/colors';
import { Chip } from '../components/Chip';
import { ClientField } from '../components/ClientField';
import { NumField } from '../components/NumField';
import { ProjectField } from '../components/ProjectField';
import { AmountText } from '../components/AmountText';
import { useStore, ExpenseCategory, EXPENSE_CATEGORIES, CATEGORY_LABEL } from '../lib/store';
import { saveReceipt, deleteReceipt } from '../lib/receipts';
import * as calc from '../lib/calc';
import { money, todayISO, longDate } from '../lib/format';

const DEFAULT_REIMBURSABLE: Record<ExpenseCategory, boolean> = EXPENSE_CATEGORIES.reduce(
  (acc, c) => ((acc[c.key] = c.reimbursable), acc),
  {} as Record<ExpenseCategory, boolean>
);

export default function ExpensesScreen() {
  const t = useTheme();
  const styles = React.useMemo(() => makeStyles(t), [t]);
  const { expenses, addExpense, removeExpense, profile } = useStore();
  const isW2 = profile.employmentType === 'w2';
  const deductWord = isW2 ? 'Out of pocket' : 'Your deductions';
  const year = new Date().getFullYear();
  const reimb = calc.reimbursableTotal(expenses, year);
  const deduct = calc.deductibleTotal(expenses, year);

  const [open, setOpen] = useState(expenses.length === 0);
  const [cat, setCat] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0].key);
  const [reimbursable, setReimbursable] = useState(DEFAULT_REIMBURSABLE[EXPENSE_CATEGORIES[0].key]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [client, setClient] = useState('');
  const [project, setProject] = useState('');
  const [receiptUri, setReceiptUri] = useState('');

  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1));

  const pickCat = (c: ExpenseCategory) => {
    setCat(c);
    setReimbursable(DEFAULT_REIMBURSABLE[c]);
  };

  const attach = async (tempUri: string) => {
    try {
      const saved = await saveReceipt(tempUri);
      // replace any previous unsaved attachment
      if (receiptUri) deleteReceipt(receiptUri);
      setReceiptUri(saved);
    } catch {
      // copy failed; leave receipt unset
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled && res.assets[0]) attach(res.assets[0].uri);
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
    if (!res.canceled && res.assets[0]) attach(res.assets[0].uri);
  };

  const clearReceipt = () => {
    if (receiptUri) deleteReceipt(receiptUri);
    setReceiptUri('');
  };

  const resetForm = () => {
    setAmount(''); setNote(''); setClient(''); setProject(''); setReceiptUri(''); setOpen(false);
  };

  const add = () => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;
    addExpense({ date: todayISO(), category: cat, amount: amt, reimbursable, client: client || undefined, project: project || undefined, receiptUri: receiptUri || undefined, note: note.trim() });
    resetForm();
  };

  const deleteExpense = (id: string, uri?: string) => {
    if (uri) deleteReceipt(uri);
    removeExpense(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.totalRow}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>To be reimbursed</Text>
            <AmountText style={[styles.totalValue, { color: t.accent }]}>{money(reimb)}</AmountText>
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{deductWord}</Text>
            <AmountText style={styles.totalValue}>{money(deduct)}</AmountText>
          </View>
        </View>

        {open ? (
          <View style={styles.form}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {EXPENSE_CATEGORIES.map((c) => (
                <Chip key={c.key} label={c.label} selected={cat === c.key} onPress={() => pickCat(c.key)} />
              ))}
            </View>
            <Text style={styles.label}>Amount ($)</Text>
            <NumField value={amount} onChangeText={setAmount} keyboardType="number-pad" placeholder="0" />
            <Text style={styles.label}>Note</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="optional" placeholderTextColor={t.faint} />
            <Text style={styles.label}>Client / job</Text>
            <ClientField value={client} onChange={setClient} />
            <Text style={styles.label}>Project</Text>
            <ProjectField value={project} onChange={setProject} />

            <Text style={styles.label}>Receipt</Text>
            {receiptUri ? (
              <View style={styles.receiptRow}>
                <Image source={{ uri: receiptUri }} style={styles.receiptThumb} />
                <Pressable style={styles.receiptRemove} onPress={clearReceipt}>
                  <Ionicons name="close-circle" size={20} color={t.danger} />
                  <Text style={styles.receiptRemoveText}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.receiptBtns}>
                <Pressable style={styles.receiptBtn} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={18} color={t.ink} />
                  <Text style={styles.receiptBtnText}>Camera</Text>
                </Pressable>
                <Pressable style={styles.receiptBtn} onPress={pickPhoto}>
                  <Ionicons name="image-outline" size={18} color={t.ink} />
                  <Text style={styles.receiptBtnText}>Library</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Reimbursable</Text>
                <Text style={styles.switchHint}>{reimbursable ? 'Goes on your expense report' : isW2 ? 'Your own cost (not deductible as W-2)' : 'Your own deduction'}</Text>
              </View>
              <Switch value={reimbursable} onValueChange={setReimbursable} trackColor={{ false: t.border, true: t.accent }} ios_backgroundColor={t.border} />
            </View>
            <Pressable style={styles.addBtn} onPress={add}><Text style={styles.addText}>Add expense</Text></Pressable>
          </View>
        ) : (
          <Pressable style={styles.openBtn} onPress={() => setOpen(true)}>
            <Ionicons name="add" size={18} color={t.ink} />
            <Text style={styles.openText}>Add expense</Text>
          </Pressable>
        )}

        {sorted.map((e) => (
          <View key={e.id} style={styles.row}>
            {e.receiptUri ? (
              <Image source={{ uri: e.receiptUri }} style={styles.rowThumb} />
            ) : null}
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle} numberOfLines={1}>{CATEGORY_LABEL[e.category]}{e.note ? ` · ${e.note}` : ''}</Text>
              <View style={styles.rowMeta}>
                <View style={[styles.tag, e.reimbursable ? styles.tagReimb : styles.tagDeduct]}>
                  <Text style={[styles.tagText, e.reimbursable ? styles.tagTextReimb : styles.tagTextDeduct]}>
                    {e.reimbursable ? 'Reimbursable' : isW2 ? 'Out of pocket' : 'Deduction'}
                  </Text>
                </View>
                <Text style={styles.rowSub} numberOfLines={1}>{[longDate(e.date), e.client, e.project].filter(Boolean).join(' · ')}</Text>
              </View>
            </View>
            <AmountText style={styles.amount}>{money(e.amount)}</AmountText>
            <Pressable hitSlop={8} onPress={() => deleteExpense(e.id, e.receiptUri)}><Ionicons name="trash-outline" size={18} color={t.faint} /></Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (t: AppColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.bg },
  content: { padding: 18, paddingBottom: 40 },

  totalRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  totalCard: { flex: 1, backgroundColor: t.surface, borderRadius: 12, padding: 14 },
  totalLabel: { fontSize: 12, color: t.muted, marginBottom: 2 },
  totalValue: { fontSize: 20, fontWeight: '500', color: t.ink },

  form: { borderWidth: 0.5, borderColor: t.border, borderRadius: 14, padding: 14, marginBottom: 12 },
  label: { fontSize: 12, color: t.muted, marginTop: 12, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { height: 44, borderWidth: 0.5, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: t.ink },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  switchLabel: { fontSize: 15, color: t.ink },
  switchHint: { fontSize: 11, color: t.muted, marginTop: 2 },
  addBtn: { backgroundColor: t.ink, borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 18 },
  addText: { color: t.onInk, fontSize: 15, fontWeight: '500' },

  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 0.5, borderColor: t.border, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 13, marginBottom: 12 },
  openText: { fontSize: 14, color: t.ink },

  receiptBtns: { flexDirection: 'row', gap: 8 },
  receiptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderWidth: 0.5, borderColor: t.border, borderRadius: 10 },
  receiptBtnText: { fontSize: 14, color: t.ink },
  receiptRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  receiptThumb: { width: 54, height: 54, borderRadius: 8, backgroundColor: t.surface },
  receiptRemove: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptRemoveText: { fontSize: 14, color: t.danger },

  hint: { fontSize: 12, color: t.muted, marginBottom: 12 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderTopWidth: 0.5, borderTopColor: t.hairline2 },
  rowThumb: { width: 36, height: 36, borderRadius: 6, backgroundColor: t.surface },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 14, color: t.ink },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tagReimb: { backgroundColor: '#E6F1FB' },
  tagDeduct: { backgroundColor: t.surface },
  tagText: { fontSize: 10, fontWeight: '500' },
  tagTextReimb: { color: '#0C447C' },
  tagTextDeduct: { color: t.muted },
  rowSub: { fontSize: 11, color: t.muted, flex: 1 },
  amount: { fontSize: 14, fontWeight: '500', color: t.ink },
});
