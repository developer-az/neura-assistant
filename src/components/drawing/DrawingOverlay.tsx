import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { DrawingStroke, StrokePoint } from '../../types';
import { Colors } from '../../utils/constants';

interface DrawingOverlayProps {
  strokes: DrawingStroke[];
  enabled: boolean;
  color?: string;
  width?: number;
  onStrokeEnd: (stroke: Omit<DrawingStroke, 'id'>) => void;
}

function pointsToPath(points: StrokePoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.1} ${p.y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export function DrawingOverlay({
  strokes,
  enabled,
  color = Colors.draw,
  width = 2.5,
  onStrokeEnd,
}: DrawingOverlayProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [livePoints, setLivePoints] = useState<StrokePoint[]>([]);
  const liveRef = useRef<StrokePoint[]>([]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize({ w, h });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: () => enabled,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        liveRef.current = [{ x: locationX, y: locationY }];
        setLivePoints([...liveRef.current]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        liveRef.current = [...liveRef.current, { x: locationX, y: locationY }];
        setLivePoints([...liveRef.current]);
      },
      onPanResponderRelease: () => {
        if (liveRef.current.length > 0) {
          onStrokeEnd({ points: liveRef.current, color, width });
        }
        liveRef.current = [];
        setLivePoints([]);
      },
      onPanResponderTerminate: () => {
        liveRef.current = [];
        setLivePoints([]);
      },
    })
  ).current;

  return (
    <View
      style={[styles.overlay, enabled ? styles.enabled : styles.passthrough]}
      onLayout={onLayout}
      {...(enabled ? panResponder.panHandlers : {})}
      pointerEvents={enabled ? 'auto' : 'none'}
    >
      {size.w > 0 ? (
        <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
          {strokes.map((stroke) => (
            <Path
              key={stroke.id}
              d={pointsToPath(stroke.points)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          ))}
          {livePoints.length > 0 ? (
            <Path
              d={pointsToPath(livePoints)}
              stroke={color}
              strokeWidth={width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          ) : null}
        </Svg>
      ) : null}
      {enabled ? <View style={styles.laminateHint} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  enabled: {
    backgroundColor: Colors.overlay,
    ...(Platform.OS === 'web' ? ({ cursor: 'crosshair' } as object) : null),
  },
  passthrough: {
    backgroundColor: 'transparent',
  },
  laminateHint: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(26,35,50,0.06)',
  },
});
