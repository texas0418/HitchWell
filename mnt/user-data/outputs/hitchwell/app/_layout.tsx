import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivacyProvider } from '../context/PrivacyContext';
import { colors } from '../theme/colors';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrivacyProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            headerTintColor: colors.ink,
            headerStyle: { backgroundColor: colors.bg },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="entry" options={{ presentation: 'modal', headerShown: true, title: 'Log a day' }} />
          <Stack.Screen name="expenses" options={{ headerShown: true, title: 'Expenses' }} />
          <Stack.Screen name="mileage" options={{ headerShown: true, title: 'Mileage' }} />
          <Stack.Screen name="certs" options={{ headerShown: true, title: 'Certs & tickets' }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
        </Stack>
      </PrivacyProvider>
    </SafeAreaProvider>
  );
}
