import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivacyProvider } from '../context/PrivacyContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PrivacyProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </PrivacyProvider>
    </SafeAreaProvider>
  );
}
