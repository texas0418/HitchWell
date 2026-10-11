// components/MoreApps.tsx
// The "More from Simon Shih" group at the foot of Settings. Three sibling apps,
// each opening its App Store page. Styled as a row group so it reads as part of
// the screen rather than an advert bolted on.
//
// No network: the list is static data from lib/moreApps.

import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, AppColors } from '../theme/colors';
import { FleetApp, relatedApps, storeUrl } from '../lib/moreApps';

export default function MoreApps() {
  const t = useTheme();
  const s = useMemo(() => makeStyles(t), [t]);
  const apps = relatedApps();

  if (apps.length === 0) return null;

  const open = (app: FleetApp) => {
    // openURL rejects when nothing can handle the scheme; nothing useful to say.
    Linking.openURL(storeUrl(app)).catch(() => {});
  };

  return (
    <>
      <Text style={s.label}>More from Simon Shih</Text>
      <View style={s.group}>
        {apps.map((app) => (
          <Pressable
            key={app.key}
            style={s.row}
            onPress={() => open(app)}
            accessibilityRole="link"
            accessibilityLabel={`${app.name}, ${app.line}. Opens the App Store.`}
          >
            <View style={s.rowIcon}>
              <Ionicons name="open-outline" size={19} color={t.ink} />
            </View>
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>{app.name}</Text>
              <Text style={s.rowHint}>{app.line}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={t.faint} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

const makeStyles = (t: AppColors) =>
  StyleSheet.create({
    label: { fontSize: 12, color: t.muted, marginTop: 12, marginBottom: 8 },
    group: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: t.border,
      borderRadius: 10,
      overflow: 'hidden',
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.hairline2,
    },
    rowIcon: { width: 24, alignItems: 'center' },
    rowBody: { flex: 1 },
    rowLabel: { fontSize: 14, color: t.ink },
    rowHint: { fontSize: 12, color: t.muted, marginTop: 2 },
  });
