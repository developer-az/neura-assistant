import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
  PanResponder,
  type GestureResponderEvent,
} from 'react-native';
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

  const containerRef = useRef<View>(null);
  const liveRef = useRef<StrokePoint[]>([]);
  const drawingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const enabledRef = useRef(enabled);
  const colorRef = useRef(color);
  const widthRef = useRef(width);
  const onStrokeEndRef = useRef(onStrokeEnd);

  enabledRef.current = enabled;
  colorRef.current = color;
  widthRef.current = width;
  onStrokeEndRef.current = onStrokeEnd;

  const measureOffset = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      offsetRef.current = { x, y };
    });
  }, []);

  useEffect(() => {
    if (enabled) measureOffset();
  }, [enabled, measureOffset]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setSize({ w, h });
    measureOffset();
  };

  const readPoint = useCallback(
    (native: {
      clientX?: number;
      clientY?: number;
      pageX?: number;
      pageY?: number;
      locationX?: number;
      locationY?: number;
    }): StrokePoint | null => {
      if (Platform.OS === 'web') {
        const node = containerRef.current as unknown as {
          getBoundingClientRect?: () => { left: number; top: number };
        } | null;
        const rect = node?.getBoundingClientRect?.();
        if (rect && typeof native.clientX === 'number' && typeof native.clientY === 'number') {
          return { x: native.clientX - rect.left, y: native.clientY - rect.top };
        }
      }

      if (typeof native.pageX === 'number' && typeof native.pageY === 'number') {
        return {
          x: native.pageX - offsetRef.current.x,
          y: native.pageY - offsetRef.current.y,
        };
      }

      if (typeof native.locationX === 'number' && typeof native.locationY === 'number') {
        return { x: native.locationX, y: native.locationY };
      }

      return null;
    },
    []
  );

  const pointFromEvent = useCallback(
    (evt: GestureResponderEvent): StrokePoint | null => readPoint(evt.nativeEvent),
    [readPoint]
  );

  const pointFromPointer = useCallback(
    (evt: { nativeEvent: { clientX?: number; clientY?: number } }): StrokePoint | null =>
      readPoint(evt.nativeEvent),
    [readPoint]
  );

  const finishStroke = useCallback(() => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (liveRef.current.length > 0) {
      onStrokeEndRef.current({
        points: liveRef.current,
        color: colorRef.current,
        width: widthRef.current,
      });
    }
    liveRef.current = [];
    setLivePoints([]);
  }, []);

  const beginStrokeFromPoint = useCallback(
    (pt: StrokePoint | null) => {
      if (!enabledRef.current || !pt) return;
      drawingRef.current = true;
      liveRef.current = [pt];
      setLivePoints([pt]);
    },
    []
  );

  const extendStrokeFromPoint = useCallback((pt: StrokePoint | null) => {
    if (!enabledRef.current || !drawingRef.current || !pt) return;
    liveRef.current = [...liveRef.current, pt];
    setLivePoints([...liveRef.current]);
  }, []);

  const beginStroke = useCallback(
    (evt: GestureResponderEvent) => {
      if (!enabledRef.current) return;
      evt.preventDefault?.();
      measureOffset();
      beginStrokeFromPoint(pointFromEvent(evt));
    },
    [measureOffset, pointFromEvent, beginStrokeFromPoint]
  );

  const extendStroke = useCallback(
    (evt: GestureResponderEvent) => {
      if (!enabledRef.current || !drawingRef.current) return;
      evt.preventDefault?.();
      extendStrokeFromPoint(pointFromEvent(evt));
    },
    [pointFromEvent, extendStrokeFromPoint]
  );

  const beginPointerStroke = useCallback(
    (evt: { nativeEvent: { clientX?: number; clientY?: number }; preventDefault?: () => void }) => {
      if (!enabledRef.current) return;
      evt.preventDefault?.();
      beginStrokeFromPoint(pointFromPointer(evt));
    },
    [pointFromPointer, beginStrokeFromPoint]
  );

  const extendPointerStroke = useCallback(
    (evt: { nativeEvent: { clientX?: number; clientY?: number }; preventDefault?: () => void }) => {
      if (!enabledRef.current || !drawingRef.current) return;
      evt.preventDefault?.();
      extendStrokeFromPoint(pointFromPointer(evt));
    },
    [pointFromPointer, extendStrokeFromPoint]
  );

  const beginStrokeRef = useRef(beginStroke);
  const extendStrokeRef = useRef(extendStroke);
  const finishStrokeRef = useRef(finishStroke);
  const beginPointerStrokeRef = useRef(beginPointerStroke);
  const extendPointerStrokeRef = useRef(extendPointerStroke);
  beginStrokeRef.current = beginStroke;
  extendStrokeRef.current = extendStroke;
  finishStrokeRef.current = finishStroke;
  beginPointerStrokeRef.current = beginPointerStroke;
  extendPointerStrokeRef.current = extendPointerStroke;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabledRef.current,
      onMoveShouldSetPanResponder: () => enabledRef.current && drawingRef.current,
      onPanResponderGrant: (evt) => beginStrokeRef.current(evt),
      onPanResponderMove: (evt) => extendStrokeRef.current(evt),
      onPanResponderRelease: () => finishStrokeRef.current(),
      onPanResponderTerminate: () => finishStrokeRef.current(),
    })
  ).current;

  const webHandlers =
    Platform.OS === 'web'
      ? {
          onPointerDown: (evt: {
            nativeEvent: { clientX?: number; clientY?: number; pointerId?: number };
            preventDefault?: () => void;
            currentTarget?: unknown;
          }) => {
            beginPointerStrokeRef.current(evt);
            const target = evt.currentTarget as { setPointerCapture?: (id: number) => void } | undefined;
            const pointerId = evt.nativeEvent.pointerId;
            if (target?.setPointerCapture && typeof pointerId === 'number') {
              target.setPointerCapture(pointerId);
            }
          },
          onPointerMove: (evt: { nativeEvent: { clientX?: number; clientY?: number }; preventDefault?: () => void }) =>
            extendPointerStrokeRef.current(evt),
          onPointerUp: () => finishStrokeRef.current(),
          onPointerCancel: () => finishStrokeRef.current(),
        }
      : {};

  return (
    <View
      ref={containerRef}
      style={[styles.overlay, enabled ? styles.enabled : styles.passthrough]}
      onLayout={onLayout}
      pointerEvents={enabled ? 'auto' : 'box-none'}
      {...(Platform.OS === 'web' ? webHandlers : panResponder.panHandlers)}
      collapsable={false}
    >
      {size.w > 0 ? (
        <Svg
          width={size.w}
          height={size.h}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
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
    ...(Platform.OS === 'web'
      ? ({ cursor: 'crosshair', touchAction: 'none', userSelect: 'none' } as object)
      : null),
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
