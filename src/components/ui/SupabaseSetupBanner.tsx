import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';

export function SupabaseSetupBanner() {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.title}>Demo mode — data stays on this device</Text>
      <Text style={styles.body}>
        Connect Supabase (URL + anon key in your env, then run database-setup.sql) to claim a
        notebook that syncs across devices.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.accentSoft,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: Typography.sm,
    color: Colors.ink,
    marginBottom: 4,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkMuted,
    lineHeight: 20,
  },
});
