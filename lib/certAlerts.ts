import { Alert, Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Cert } from './store';
import { daysUntil, fromISO } from './format';

// expo-notifications needs native modules that only exist in dev builds made
// after it was installed. Check for the native side first, so older builds
// fall back to in-app reminders without requiring the package at all.
let Notifications: typeof import('expo-notifications') | null = null;
let checked = false;
function getNotifications() {
  if (checked) return Notifications;
  checked = true;
  if (!requireOptionalNativeModule('ExpoPushTokenManager')) return null;
  try {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return Notifications;
  } catch {
    Notifications = null;
    return null;
  }
}

// Cert expiry alerts, two layers:
// 1. Local push notifications scheduled at 30 days before expiry and on the
//    expiry date (9am local). Rescheduled from scratch whenever certs change.
// 2. An in-app reminder popup on app open when anything expires within 30 days
//    or has already expired. Shown once per app session.

const WARN_DAYS = 30;

export async function syncCertNotifications(certs: Cert[]): Promise<void> {
  const N = getNotifications();
  if (!N) return; // native module absent (older dev build); in-app reminders still work
  try {
    const perm = await N.getPermissionsAsync();
    if (!perm.granted) {
      const req = await N.requestPermissionsAsync();
      if (!req.granted) return;
    }
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('certs', {
        name: 'Cert expiry',
        importance: N.AndroidImportance.DEFAULT,
      });
    }

    await N.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    for (const c of certs) {
      const expiry = fromISO(c.expiry);
      expiry.setHours(9, 0, 0, 0);

      const warnAt = new Date(expiry.getTime() - WARN_DAYS * 86400000);
      if (warnAt.getTime() > now) {
        await N.scheduleNotificationAsync({
          content: { title: 'Cert expiring soon', body: `${c.name} expires in ${WARN_DAYS} days.` },
          trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: warnAt },
        });
      }
      if (expiry.getTime() > now) {
        await N.scheduleNotificationAsync({
          content: { title: 'Cert expired', body: `${c.name} expires today. Renew it.` },
          trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: expiry },
        });
      }
    }
  } catch {
    // Notifications unavailable (permissions denied or Expo Go); in-app reminders still work.
  }
}

let remindedThisSession = false;

export function showCertReminderOnce(certs: Cert[]): void {
  if (remindedThisSession) return;
  const soon = certs
    .map((c) => ({ c, days: daysUntil(c.expiry) }))
    .filter((x) => x.days <= WARN_DAYS)
    .sort((a, b) => a.days - b.days);
  if (soon.length === 0) return;

  remindedThisSession = true;
  const lines = soon
    .map((x) => (x.days < 0 ? `${x.c.name}: expired ${Math.abs(x.days)}d ago` : `${x.c.name}: ${x.days} days left`))
    .join('\n');
  Alert.alert(soon.some((x) => x.days < 0) ? 'Expired cert' : 'Cert expiring soon', lines);
}
