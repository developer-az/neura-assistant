import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { DrawingOverlay } from '../drawing/DrawingOverlay';
import type { DrawingStroke } from '../../types';

interface NotebookScrollProps {
  children: ReactNode;
  strokes: DrawingStroke[];
  drawMode: boolean;
  onStrokeEnd: (stroke: Omit<DrawingStroke, 'id'>) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollBottomInset?: number;
}

/** Scrollable notebook page — drawing layer lives inside content so marks scroll with the page. */
export function NotebookScroll({
  children,
  strokes,
  drawMode,
  onStrokeEnd,
  contentContainerStyle,
  scrollBottomInset = 100,
}: NotebookScrollProps) {
  return (
    <ScrollView
      scrollEnabled={!drawMode}
      contentContainerStyle={[styles.scrollGrow, { paddingBottom: scrollBottomInset }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.contentSheet, contentContainerStyle]}>
        {children}
        <DrawingOverlay strokes={strokes} enabled={drawMode} onStrokeEnd={onStrokeEnd} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollGrow: {
    flexGrow: 1,
  },
  contentSheet: {
    position: 'relative',
  },
});
