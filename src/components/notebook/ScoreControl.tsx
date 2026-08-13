import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Colors, Fonts, Spacing, Typography, SCORE_MAX, SCORE_MIN, SCORE_STEP } from '../../utils/constants';
import { clampScore, formatScore } from '../../utils/week';

interface ScoreControlProps {
  value: number;
  onChange: (next: number) => void;
  label?: string;
}

export function ScoreControl({ value, onChange, label }: ScoreControlProps) {
  const bump = (delta: number) => {
    onChange(clampScore(value + delta, SCORE_MIN, SCORE_MAX));
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.step}
          onPress={() => bump(-SCORE_STEP)}
          accessibilityLabel="Decrease"
        >
          <Minus size={18} color={Colors.ink} strokeWidth={2} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={formatScore(value)}
          keyboardType="decimal-pad"
          selectTextOnFocus
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9.]/g, '');
            if (cleaned === '' || cleaned === '.') return;
            const num = parseFloat(cleaned);
            if (!Number.isNaN(num)) {
              onChange(clampScore(num, SCORE_MIN, SCORE_MAX));
            }
          }}
          accessibilityLabel="Score"
        />

        <TouchableOpacity
          style={styles.step}
          onPress={() => bump(SCORE_STEP)}
          accessibilityLabel="Increase"
        >
          <Plus size={18} color={Colors.ink} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Tap − / + for small shifts, or type the number</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.inkMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  step: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.display,
    fontSize: Typography.xl3,
    color: Colors.ink,
    textAlign: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 8,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: Typography.xs,
    color: Colors.inkFaint,
  },
});
