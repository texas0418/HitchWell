import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Cert } from './store';
import { daysUntil, fromISO } from './format';

// Cert expiry alerts, two layers:
// 1. Local push notifications scheduled at 30 days before expiry and on the
//    expiry date (9am local). Rescheduled from scratch whenever certs change.
// 2. An in-app reminder popup on app open when anything expires within 30 days
//    or has already expired. Shown once per app session.

const WARN_DAYS = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function syncCertNotifications(certs: Cert[]): Promise<void> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) {
      const req = await Notifications.requestPermissionsAsync();
      if (!req.granted) return;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('certs', {
        name: 'Cert expiry',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = Date.now();
    for (const c of certs) {
      const expiry = fromISO(c.expiry);
      expiry.setHours(9, 0, 0, 0);

      const warnAt = new Date(expiry.getTime() - WARN_DAYS * 86400000);
      if (warnAt.getTime() > now) {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Cert expiring soon', body: `${c.name} expires in ${WARN_DAYS} days.` },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: warnAt },
        });
      }
      if (expiry.getTime() > now) {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Cert expired', body: `${c.name} expires today. Renew it.` },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: expiry },
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
