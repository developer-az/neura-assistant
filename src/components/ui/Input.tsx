import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({ label, error, containerStyle, style, ...props }) => (
  <View style={[styles.container, containerStyle]}>
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <TextInput
      placeholderTextColor={Colors.inkFaint}
      style={[styles.input, error ? styles.inputError : null, style]}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.inkMuted,
    letterSpacing: 0.3,
  },
  input: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.ink,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: Typography.xs,
    color: Colors.danger,
  },
});
