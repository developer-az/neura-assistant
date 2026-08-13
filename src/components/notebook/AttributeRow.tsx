import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Attribute } from '../../types';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';
import { formatScore } from '../../utils/week';

interface AttributeRowProps {
  attribute: Attribute;
  delta?: number | null;
  onPress?: () => void;
  compact?: boolean;
}

export function AttributeRow({ attribute, delta, onPress, compact }: AttributeRowProps) {
  const content = (
    <View style={[styles.row, compact && styles.compact]}>
      <Text style={styles.name} numberOfLines={1}>
        {attribute.name}
      </Text>
      <View style={styles.scoreBlock}>
        {delta != null && delta !== 0 ? (
          <Text style={[styles.delta, delta > 0 ? styles.up : styles.down]}>
            {delta > 0 ? '+' : ''}
            {formatScore(delta)}
          </Text>
        ) : null}
        <Text style={styles.score}>{formatScore(Number(attribute.current_score))}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paperLine,
    gap: Spacing.md,
  },
  compact: {
    paddingVertical: 6,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.ink,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  score: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl,
    color: Colors.ink,
    minWidth: 36,
    textAlign: 'right',
  },
  delta: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.sm,
  },
  up: {
    color: Colors.up,
  },
  down: {
    color: Colors.down,
  },
});
