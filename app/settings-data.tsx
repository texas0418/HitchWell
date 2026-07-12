import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/colors';
import { useStore } from '../lib/store';
import { clearAllReceipts } from '../lib/receipts';
import { exportBackup, pickBackupFile } from '../lib/backup';
import { makeSettingsStyles } from '../lib/settingsStyles';

export default function SettingsData() {
  const t = useTheme();
  const s = useMemo(() => makeSettingsStyles(t), [t]);
  const { loadSample, clearAll, importAll } = useStore();

  const onExportBackup = () => {
    const st = useStore.getState();
    exportBackup({
      profile: st.profile,
      dayEntries: st.dayEntries,
      expenses: st.expenses,
      mileage: st.mileage,
      certs: st.certs,
      clients: st.clients,
      projects: st.projects,
      invoiceCounter: st.invoiceCounter,
    });
  };

  const onImportBackup = async () => {
    const picked = await pickBackupFile();
    if (picked === 'needs-build') {
      Alert.alert('Needs an app update', 'Importing uses a component added after this build. Install the next app build to enable it. Export works now.');
      return;
    }
    if (!picked) return;
    Alert.alert(
      'Replace all data?',
      `This replaces everything on this device with the backup from ${picked.exportedAt.slice(0, 10)}. Receipt photos are not part of backups.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace', style: 'destructive', onPress: () => { importAll(picked.data); Alert.alert('Backup restored', 'Your data was replaced with the backup.'); } },
      ]
    );
  };

  const confirmClear = () => {
    Alert.alert('Clear all data?', 'This removes every day, expense, mileage trip, and cert on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { clearAll(); clearAllReceipts(); Alert.alert('Data cleared', 'Everything on this device was removed.'); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.sectionTitle}>Backup</Text>
        <Text style={s.note}>Save the file to iCloud Drive or email it to yourself. Receipt photos are not included; exported PDFs already carry them.</Text>
        <Pressable style={s.actionBtn} onPress={onExportBackup}><Text style={s.actionText}>Export Backup (JSON)</Text></Pressable>
        <Pressable style={s.actionBtn} onPress={onImportBackup}><Text style={s.actionText}>Import Backup</Text></Pressable>

        <Text style={s.sectionTitle}>Test Data</Text>
        <Pressable style={s.actionBtn} onPress={() => loadSample()}><Text style={s.actionText}>Load Sample Data</Text></Pressable>
        <Pressable style={s.actionBtn} onPress={confirmClear}><Text style={[s.actionText, { color: t.danger }]}>Clear All Data</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
