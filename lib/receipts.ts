import * as FileSystem from 'expo-file-system/legacy';

// Receipts are stored as files in the app's document directory. Only the file
// path is kept on the expense. Photos must never go in the persisted store,
// which would overflow AsyncStorage. The /legacy import is required on
// Expo SDK 54+, where these functions moved out of the main entry point.

const DIR = FileSystem.documentDirectory + 'receipts/';

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

// Copies a picked/captured temp file into permanent storage, returns its path.
export async function saveReceipt(tempUri: string): Promise<string> {
  await ensureDir();
  const ext = (tempUri.split('.').pop() || 'jpg').split('?')[0].slice(0, 5);
  const name = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const dest = DIR + name;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
}

export async function deleteReceipt(uri?: string): Promise<void> {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // already gone
  }
}

export async function clearAllReceipts(): Promise<void> {
  try {
    await FileSystem.deleteAsync(DIR, { idempotent: true });
  } catch {
    // nothing to clear
  }
}
