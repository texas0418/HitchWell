import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useStore, useHydrated } from '../../lib/store';

export default function TabsLayout() {
  const hydrated = useHydrated();
  const onboarded = useStore((s) => s.onboarded);

  if (!hydrated) return null;
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: { borderTopColor: colors.hairline, backgroundColor: colors.bg },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Money', tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="logbook"
        options={{ title: 'Log', tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="states"
        options={{ title: 'States', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
