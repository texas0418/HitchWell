import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { todayISO } from './format';

// On-device backup: the whole store as a JSON file the user keeps wherever
// they want (Files, iCloud Drive, email to self). Import replaces current
// data after confirmation. Receipt photos are files, not store data, so they
// are NOT included — exported invoice/report PDFs already carry the images.

export const BACKUP_SCHEMA = 'hitchwell-backup';
export const BACKUP_VERSION = 1;

export type BackupPayload = {
  schema: string;
  backupVersion: number;
  exportedAt: string;
  data: Record<string, unknown>;
};

export async function exportBackup(data: Record<string, unknown>): Promise<boolean> {
  try {
    const payload: BackupPayload = {
      schema: BACKUP_SCHEMA,
      backupVersion: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };
    const path = `${FileSystem.cacheDirectory}HitchWell_Backup_${todayISO()}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(payload));
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'HitchWell backup' });
      return true;
    }
    Alert.alert('Sharing unavailable', 'This device cannot share files.');
    return false;
  } catch {
    Alert.alert('Backup failed', 'Could not create the backup file.');
    return false;
  }
}

// Import needs expo-document-picker, a native module that only exists in
// builds made after it was installed. Lazy-check so older builds degrade to
// a clear message instead of crashing.
export async function pickBackupFile(): Promise<BackupPayload | 'needs-build' | null> {
  let DocumentPicker: typeof import('expo-document-picker');
  try {
    DocumentPicker = require('expo-document-picker');
  } catch {
    return 'needs-build';
  }
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]?.uri) return null;
    const raw = await FileSystem.readAsStringAsync(res.assets[0].uri);
    const parsed = JSON.parse(raw) as BackupPayload;
    if (parsed?.schema !== BACKUP_SCHEMA || !parsed.data || typeof parsed.data !== 'object') {
      Alert.alert('Not a HitchWell backup', 'That file is not a valid backup.');
      return null;
    }
    return parsed;
  } catch {
    Alert.alert('Import failed', 'Could not read that file.');
    return null;
  }
}
