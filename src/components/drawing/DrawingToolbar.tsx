import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pencil, Eraser, Undo2, X } from 'lucide-react-native';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';

interface DrawingToolbarProps {
  drawMode: boolean;
  onToggle: () => void;
  onUndo: () => void;
  onClear: () => void;
  strokeCount: number;
}

export function DrawingToolbar({
  drawMode,
  onToggle,
  onUndo,
  onClear,
  strokeCount,
}: DrawingToolbarProps) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={[styles.chip, drawMode && styles.chipActive]}
        onPress={onToggle}
        accessibilityLabel={drawMode ? 'Stop drawing' : 'Draw on page'}
      >
        {drawMode ? (
          <X size={16} color={Colors.white} strokeWidth={2} />
        ) : (
          <Pencil size={16} color={Colors.ink} strokeWidth={2} />
        )}
        <Text style={[styles.chipText, drawMode && styles.chipTextActive]}>
          {drawMode ? 'Done' : 'Draw'}
        </Text>
      </TouchableOpacity>

      {drawMode ? (
        <>
          <TouchableOpacity
            style={styles.chip}
            onPress={onUndo}
            disabled={strokeCount === 0}
            accessibilityLabel="Undo stroke"
          >
            <Undo2 size={16} color={strokeCount ? Colors.ink : Colors.inkFaint} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chip}
            onPress={onClear}
            disabled={strokeCount === 0}
            accessibilityLabel="Clear drawing"
          >
            <Eraser size={16} color={strokeCount ? Colors.ink : Colors.inkFaint} strokeWidth={2} />
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceRaised,
  },
  chipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  chipText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.ink,
  },
  chipTextActive: {
    color: Colors.white,
  },
});
