import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivacyProvider } from '../context/PrivacyContext';
import { useTheme, useScheme } from '../theme/colors';
import { useStore, useHydrated } from '../lib/store';
import { syncCertNotifications, showCertReminderOnce } from '../lib/certAlerts';

export default function RootLayout() {
  const t = useTheme();
  const scheme = useScheme();
  const hydrated = useHydrated();
  const certs = useStore((s) => s.certs);
  const onboarded = useStore((s) => s.onboarded);

  // Once the store is loaded: pop the in-app reminder for anything expiring
  // soon, and (re)schedule local notifications whenever the cert list changes.
  useEffect(() => {
    if (!hydrated || !onboarded) return;
    showCertReminderOnce(certs);
    syncCertNotifications(certs);
  }, [hydrated, onboarded, certs]);

  return (
    <SafeAreaProvider>
      <PrivacyProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            headerTintColor: t.ink,
            headerStyle: { backgroundColor: t.bg },
            contentStyle: { backgroundColor: t.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ title: 'Back' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="entry" options={{ presentation: 'modal', headerShown: true, title: 'Log Days' }} />
          <Stack.Screen name="report" options={{ headerShown: true, title: 'Monthly Report' }} />
          <Stack.Screen name="expenses" options={{ headerShown: true, title: 'Expenses' }} />
          <Stack.Screen name="mileage" options={{ headerShown: true, title: 'Mileage' }} />
          <Stack.Screen name="certs" options={{ headerShown: true, title: 'Certs & Tickets' }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
        </Stack>
      </PrivacyProvider>
    </SafeAreaProvider>
  );
}
